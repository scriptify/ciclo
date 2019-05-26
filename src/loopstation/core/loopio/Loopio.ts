import { v4 } from 'uuid';

import AudioLooper from '../audio-looper/AudioLooper';
import Master from '../master/Master';
import BufferChnl from '../buffer-chnl/BufferChnl';
import ChnlGroup from '../chnl-group/ChnlGroup';
import { EffectsCollection } from '../effect-units-collection';
import Chnl from '../chnl/Chnl';
import EffectUnit from '../effect-unit/EffectUnit';
import AudioBufferRecorder from '../audio-buffer-recorder/AudioBufferRecorder';
import {
  listExternalAudioModules,
  createExternalAudioModule,
} from '../external-audio-modules/ExternalAudioModule';

interface SavedRecording {
  groupId: string;
  bufferChnl: BufferChnl;
  disconnectFromGroup: () => void;
}

interface SetEffectValueParams {
  id?: string;
  effectName: keyof EffectsCollection;
  effectValueName: string;
  value: number;
}

interface ChangeEffectStatusParams {
  id?: string;
  effectName: keyof EffectsCollection;
  isEnabled?: boolean;
}

interface LoopIoState {
  /** New recordings will be added to current active group */
  activeGroup: string;
  groups: Map<string, ChnlGroup>;
  /** A recording always belongs to a group */
  recordings: Map<string, SavedRecording>;
  isRecording: boolean;
  timing: TimingData;
  externalAudioModules: ExternalAudioModule[];
}

export default class Loopio {
  private audioLooper: AudioLooper;
  private recorder: AudioBufferRecorder;
  private master: Master;
  private audioCtx: AudioContext;
  private state: LoopIoState;
  private stateChangedCallbacks: ((s: SerializableLoopIoState) => void)[] = [];

  constructor() {
    this.audioCtx = new AudioContext();
    this.recorder = new AudioBufferRecorder(this.audioCtx);
    this.audioLooper = new AudioLooper(this.audioCtx, this.recorder);
    this.master = new Master(this.audioCtx);

    this.state = {
      isRecording: false,
      activeGroup: '',
      groups: new Map(),
      recordings: new Map(),
      timing: {
        bpm: 0,
        measureDuration: 0,
      },
      externalAudioModules: Array(100).fill(null), // Needed because of strange MobX bug, fix ASAP
    };

    this.setup();
  }

  static getEffectOfChnl(
    chnl: Chnl,
    effectName: keyof EffectsCollection,
  ): EffectUnit {
    const effect = chnl.getEffect(effectName);
    if (!effect) {
      throw new Error(`Effect ${effectName} does not exist on Chnl.`);
    }
    return effect;
  }

  private async setup() {
    this.audioLooper.addEventListener('recordingstart', () => {
      this.setIsRecording(true);
    });

    this.audioLooper.addEventListener(
      'timingdataavailable',
      (t: TimingData) => {
        this.setTimingData(t);
      },
    );

    this.audioLooper.addEventListener(
      'recordingstop',
      (buffer: AudioBufferSourceNode) => {
        this.setIsRecording(false);
        const newBufferChnl = new BufferChnl(this.audioCtx, buffer);
        this.onNewRecording(newBufferChnl);
      },
    );

    const externalAudioModules = await listExternalAudioModules();
    console.log({ externalAudioModules });
    this.setExternalAudioModules(externalAudioModules);
  }

  /**
   * If a group exists, add the new recording
   * to the currently active group.
   * If not, create a new group and add it.
   */
  private onNewRecording(bufferChnl: BufferChnl) {
    let group: ChnlGroup;
    let groupId: string;
    if (this.state.activeGroup === '') {
      const { newGroup, newGroupId } = this.addNewGroup();
      group = newGroup;
      groupId = newGroupId;
    } else {
      const foundGroup = this.state.groups.get(this.state.activeGroup);
      if (!foundGroup) {
        throw new Error('Tried to add recording to inexistent ChnlGroup!');
      }
      group = foundGroup;
      groupId = this.state.activeGroup;
    }

    const newChnlId = v4();
    const disconnectFromGroup = group.add(bufferChnl.chnl);
    this.addRecording(newChnlId, { groupId, bufferChnl, disconnectFromGroup });
  }

  private addNewGroup() {
    const newGroup = new ChnlGroup(this.audioCtx);
    // Connect to master
    newGroup.masterChnl.connect(this.master.chnl);
    const newGroupId = v4();
    this.setActiveGroup(newGroupId);
    this.addGroupToState(newGroupId, newGroup);
    return { newGroup, newGroupId };
  }

  private onStateChange() {
    const serializedState = this.serializeState();
    this.stateChangedCallbacks.forEach(cb => cb(serializedState));
  }

  private getChnlFromNode(nodeType: LoopIoNodeType, id?: string): Chnl {
    const requireId = () => {
      if (!id) {
        throw new Error(`Id not specified when setting effect for ${nodeType}`);
      }
    };

    let chnlToApplyEffectTo: Chnl;
    switch (nodeType) {
      case 'master':
        chnlToApplyEffectTo = this.master.chnl;
        break;
      case 'group':
        requireId();
        const group = this.state.groups.get(id || '');
        if (!group) {
          throw new Error(`Group ${id} does not exist.`);
        }
        chnlToApplyEffectTo = group.masterChnl;
        break;
      case 'recording':
        requireId();
        const recording = this.state.recordings.get(id || '');
        if (!recording) {
          throw new Error(`Recording ${id} does not exist.`);
        }
        chnlToApplyEffectTo = recording.bufferChnl.chnl;
        break;
      default:
        throw new Error('Invalid node type');
    }

    return chnlToApplyEffectTo;
  }

  requireGroupExists(id: string): ChnlGroup {
    if (!this.state.groups.has(id)) {
      throw new Error(`This group does not exist: ${id}`);
    }
    return this.state.groups.get(id) as ChnlGroup;
  }

  requireRecordingExists(id: string): SavedRecording {
    if (!this.state.recordings.has(id)) {
      throw new Error(`This recording does not exist: ${id}`);
    }
    return this.state.recordings.get(id) as SavedRecording;
  }

  /** All methods below modify the state DIRECTLY */
  private setExternalAudioModules(externalAudioModules: ExternalAudioModule[]) {
    this.state.externalAudioModules = externalAudioModules;
    this.onStateChange();
  }

  private setActiveGroup(id: string) {
    this.state.activeGroup = id;
    this.onStateChange();
  }

  private setIsRecording(isRecording: boolean) {
    this.state.isRecording = isRecording;
    this.onStateChange();
  }

  private addRecording(newChnlId: string, rec: SavedRecording) {
    this.state.recordings.set(newChnlId, rec);
    this.onStateChange();
  }

  private addGroupToState(newGroupId: string, newGroup: ChnlGroup) {
    this.state.groups.set(newGroupId, newGroup);
    this.onStateChange();
  }

  private setTimingData(t: TimingData) {
    this.state.timing = t;
    this.onStateChange();
  }

  /** Public API starting here */

  public toggleRecording({ numMeasures = 1 }) {
    if (this.state.isRecording) {
      this.stopRecording({ numMeasures });
    } else {
      this.startRecording();
    }
  }

  public startRecording() {
    this.audioLooper.startRecording();
  }

  public stopRecording({ numMeasures = 1 }) {
    this.audioLooper.stopRecording({ numMeasures });
  }

  public newGroup() {
    this.addNewGroup();
  }

  public selectGroup(id: string) {
    this.requireGroupExists(id);
    this.setActiveGroup(id);
  }

  public toggleEffect(
    nodeType: LoopIoNodeType,
    payload: ChangeEffectStatusParams,
  ) {
    const chnl = this.getChnlFromNode(nodeType, payload.id);
    const effect = Loopio.getEffectOfChnl(chnl, payload.effectName);
    const isEnabled = payload.isEnabled || effect.serialize().state.isEnabled;
    if (isEnabled) {
      chnl.removeEffect(payload.effectName);
      effect.disable();
    } else {
      effect.enable();
      chnl.addEffect(payload.effectName);
    }
    this.onStateChange();
  }

  public setEffectValue(
    nodeType: LoopIoNodeType,
    payload: SetEffectValueParams,
  ) {
    const chnl = this.getChnlFromNode(nodeType, payload.id);
    const effect = Loopio.getEffectOfChnl(chnl, payload.effectName);
    effect.setValue(payload.effectValueName, payload.value);
    this.onStateChange();
  }

  public mute(nodeType: LoopIoNodeType, id?: string) {
    this.setEffectValue(nodeType, {
      id,
      effectName: 'gain',
      effectValueName: 'muted',
      value: 1,
    });
  }

  public unmute(nodeType: LoopIoNodeType, id?: string) {
    this.setEffectValue(nodeType, {
      id,
      effectName: 'gain',
      effectValueName: 'muted',
      value: 0,
    });
  }

  public moveRecordingToGroup(groupId: string, recordingId: string) {
    const group = this.requireGroupExists(groupId);
    const recording = this.requireRecordingExists(recordingId);
    // Disconnect from old group
    recording.disconnectFromGroup();
    recording.disconnectFromGroup = group.add(recording.bufferChnl.chnl);
    recording.groupId = groupId;
    this.onStateChange();
  }

  public deleteRecording(recordingId: string) {
    // TODO: Test if it would also work if not disconnected from group
    //    To see if AudioNode is really garbage collected
    const recording = this.requireRecordingExists(recordingId);
    recording.disconnectFromGroup();
    this.state.recordings.delete(recordingId);
    this.onStateChange();
  }

  public deleteGroup(groupId: string) {
    const group = this.requireGroupExists(groupId);
    const recordingsInGroup: string[] = Array.from(this.state.recordings)
      .filter(([, rec]) => rec.groupId === groupId)
      .map(([id]) => id);

    recordingsInGroup.forEach(recToDelete => {
      this.deleteRecording(recToDelete);
    });

    group.masterChnl.disconnect(this.master.chnl);
    this.state.groups.delete(groupId);

    // if group was active group, reset active group
    if (this.state.activeGroup === groupId) {
      this.setActiveGroup('');
    }

    this.onStateChange();
  }

  public getMaster(): Master {
    return this.master;
  }

  public serializeState(): SerializableLoopIoState {
    return {
      timing: this.state.timing,
      isRecording: this.state.isRecording,
      activeGroup: this.state.activeGroup,
      groups: Array.from(this.state.groups).map(([id, group]) => ({
        id,
        group: group.serialize(),
      })),
      recordings: Array.from(this.state.recordings).map(([id, recording]) => ({
        id,
        recording: {
          groupId: recording.groupId,
          bufferChnl: recording.bufferChnl.serialize(),
        },
      })),
      externalAudioModules: this.state.externalAudioModules,
    };
  }

  /**
   * Passed callback will be called on state change.
   * Returns a function which removes the listener
   */
  public stateChange(cb: (s: SerializableLoopIoState) => void) {
    this.stateChangedCallbacks.push(cb);
    return () => {
      this.stateChangedCallbacks = this.stateChangedCallbacks.filter(
        currCb => currCb !== cb,
      );
    };
  }

  public getClock() {
    // Can re-use clock of audioLooper
    return this.audioLooper.getClock();
  }

  public createExternalAudioModules(externalAudioModule: ExternalAudioModule) {
    return createExternalAudioModule(
      externalAudioModule,
      this.audioCtx,
      this.recorder.getExternalInput(),
    );
  }
}
