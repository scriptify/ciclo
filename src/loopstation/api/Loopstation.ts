import { v4 } from 'uuid';

import EventEmitter from '../util/EventEmitter';
import TypedEventEmitter from '../util/TypedEventEmitter';
import AudioLooper, { LoopstationBuffer } from '../core/AudioLooper';
import {
  GlobalState,
  InternalState,
  LoopstationEvents,
  PossibleMeasure,
  RecordState,
  LoopstationActions,
  ELoopstationActions,
  ELoopstationEvents,
} from '.';

/** Main API interface which is used from the outside */
export default class Loopstation {
  private globalState: GlobalState;
  private internalState: InternalState;
  private events: TypedEventEmitter<LoopstationEvents>;

  private audioCtx: AudioContext;
  private audioLooper: AudioLooper;

  constructor() {
    this.audioCtx = new AudioContext();
    this.audioLooper = new AudioLooper(this.audioCtx);
    this.globalState = {
      numMeasures: PossibleMeasure.ONE,
      recordingState: RecordState.IDLE,
      groups: [],
      activeGroup: '',
    };
    this.internalState = {
      wasFirstPhraseRecorded: false,
    };
    this.events = new EventEmitter();
    this.setup();
  }

  /* Public methods */

  public action<ActionType extends keyof LoopstationActions>(
    type: ActionType,
    payload?: LoopstationActions[ActionType],
  ) {
    switch (type) {
      case ELoopstationActions.SET_MEASUREMENT:
        this.setMeasurement(payload as PossibleMeasure);
        break;
      case ELoopstationActions.START_RECORDING:
        this.startRecording();
        break;
      case ELoopstationActions.STOP_RECORDING:
        this.stopRecording();
        break;
    }
  }

  public onStateChange(cb: (state: GlobalState) => void) {
    this.events.addEventListener(ELoopstationEvents.GLOBALSTATE_CHANGE, cb);
  }

  public getCurrentState(): GlobalState {
    return this.globalState;
  }

  /* Actual LoopstationActions implementation */

  /**
   * Set the global measurement for the first phrase.
   * Can only be executed if the the first phrase wasn't recorded yet.
   **/
  private setMeasurement(numMeasures: PossibleMeasure) {
    if (this.internalState.wasFirstPhraseRecorded) {
      throw new Error(`
        Measure can only be set for the first recorded phrase!
        First phrase already exists.
      `);
    }
    this.setGlobalState({
      ...this.globalState,
      numMeasures,
    });
  }

  private startRecording() {
    this.audioLooper.startRecording();
  }

  private stopRecording() {
    this.audioLooper.stopRecording({ numMeasures: this.globalState.numMeasures });
  }

  /* Private utility methods */

  private setup() {
    this.audioLooper.addEventListener('recordingstart', () => {
      this.setGlobalState({
        ...this.globalState,
        recordingState: RecordState.RECORDING,
      });
    });

    this.audioLooper.addEventListener('recordingstop', (phrase: LoopstationBuffer) => {
      this.setGlobalState({
        ...this.globalState,
        ...this.addToGroupOrCreate(phrase),
        recordingState: RecordState.IDLE,
      });
      this.setInternalState({
        ...this.internalState,
        wasFirstPhraseRecorded: true,
      });
    });
  }

  private setGlobalState(newGlobalState: GlobalState) {
    this.globalState = newGlobalState;
    this.events.emit(ELoopstationEvents.GLOBALSTATE_CHANGE, this.globalState);
  }

  private setInternalState(newInternalState: InternalState) {
    this.internalState = newInternalState;
    this.events.emit(ELoopstationEvents.INTERNALSTATE_CHANGE, this.internalState);
  }

  /** Adds a new phrase to the  currently active group.
   * If there are no groups, a new one is created.
   */
  private addToGroupOrCreate(phrase: LoopstationBuffer): GlobalState {
    if (this.globalState.groups.length === 0) {
      const id = v4();
      return {
        ...this.globalState,
        activeGroup: id,
        groups: [
          {
            id,
            phrases: [phrase],
          },
        ],
      };
    }

    return {
      ...this.globalState,
      groups: this.globalState.groups.map((group) => {
        if (group.id === this.globalState.activeGroup) {
          return {
            ...group,
            phrases: group.phrases.concat(phrase),
          };
        }
        return group;
      }),
    };
  }
}
