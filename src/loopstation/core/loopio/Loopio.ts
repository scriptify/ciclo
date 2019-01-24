import { v4 } from 'uuid';

import AudioLooper from '../audio-looper/AudioLooper';
import Master from '../master/Master';
import BufferChnl from '../buffer-chnl/BufferChnl';
import ChnlGroup from '../chnl-group/ChnlGroup';
import { EffectsCollection } from '../effect-units-collection';
import Chnl from '../chnl/Chnl';
import EffectUnit from '../effect-unit/EffectUnit';

interface SavedRecording {
  groupId: string;
  bufferChnl: BufferChnl;
  disconnectFromGroup: () => void;
}

type LoopIoNodeType = 'master' | 'recording' | 'group';

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
}

export default class Loopio {
  private audioLooper: AudioLooper;
  private master: Master;
  private audioCtx: AudioContext;
  private state: LoopIoState;
  private stateChanged: (s: SerializableLoopIoState) => void;

  constructor(stateChanged: (s: SerializableLoopIoState) => void) {
    this.audioCtx = new AudioContext();
    this.audioLooper = new AudioLooper(this.audioCtx);
    this.master = new Master(this.audioCtx);

    this.stateChanged = stateChanged;

    this.state = {
      isRecording: false,
      activeGroup: '',
      groups: new Map(),
      recordings: new Map(),
    };

    this.setup();
  }

  static getEffectOfChnl(chnl: Chnl, effectName: keyof EffectsCollection): EffectUnit {
    const effect = chnl.getEffect(effectName);
    if (!effect) {
      throw new Error(`Effect ${effectName} does not exist on Chnl.`);
    }
    return effect;
  }

  private setup() {
    this.audioLooper.addEventListener('recordingstart', () => {
      this.setIsRecording(false);
    });

    this.audioLooper.addEventListener('recordingstop', (buffer: AudioBufferSourceNode) => {
      const newBufferChnl = new BufferChnl(this.audioCtx, buffer);
      this.onNewRecording(newBufferChnl);
    });
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

  private serializeState(): SerializableLoopIoState {
    return {
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
    };
  }

  private onStateChange() {
    this.stateChanged(this.serializeState());
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

  /** All methods below modify the state DIRECTLY */

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

  /** Public API starting here */

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
    if (!this.state.groups.has(id)) {
      throw new Error(`You tried to select an inexistent group: ${id}`);
    }
    this.setActiveGroup(id);
  }

  public toggleEffect(nodeType: LoopIoNodeType, payload: ChangeEffectStatusParams) {
    const chnl = this.getChnlFromNode(nodeType, payload.id);
    const effect = Loopio.getEffectOfChnl(chnl, payload.effectName);
    const isEnabled = payload.isEnabled || effect.serialize().state.isEnabled;
    if (isEnabled) {
      effect.enable();
    } else {
      effect.disable();
    }
    this.onStateChange();
  }

  public setEffectValue(nodeType: LoopIoNodeType, payload: SetEffectValueParams) {
    const chnl = this.getChnlFromNode(nodeType, payload.id);
    const effect = Loopio.getEffectOfChnl(chnl, payload.effectName);
    effect.setValue(payload.effectValueName, payload.value);
    this.onStateChange();
  }

  public mute(nodeType: LoopIoNodeType, id?: string) {
    this.setEffectValue(nodeType, {
      id,
      effectName: 'gain',
      effectValueName: 'gain',
      value: 0,
    });
  }

  public unmute(nodeType: LoopIoNodeType, id?: string) {
    this.setEffectValue(nodeType, {
      id,
      effectName: 'gain',
      effectValueName: 'gain',
      value: 1,
    });
  }

  public getMaster(): Master {
    return this.master;
  }
}