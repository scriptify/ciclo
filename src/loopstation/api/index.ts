import { LoopstationBuffer } from '../core/AudioLooper';

export enum PossibleMeasure {
  ONE = 1,
  HALF = 1 / 2,
  FOURTH = 1 / 2,
  EIGHTH = 1 / 8,
}

export enum RecordState {
  IDLE = 0,
  RECORDING = 1,
}

export interface Group {
  id: string;
  phrases: LoopstationBuffer[];
}

export interface GlobalState {
  numMeasures: PossibleMeasure;
  recordingState: RecordState;
  groups: Group[];
  activeGroup: string;
}

export interface InternalState {
  wasFirstPhraseRecorded: boolean;
}

export enum ELoopstationEvents {
  GLOBALSTATE_CHANGE = 'globalstatechange',
  INTERNALSTATE_CHANGE = 'internalstatechange',
}

export interface LoopstationEvents {
  [ELoopstationEvents.GLOBALSTATE_CHANGE]: GlobalState;
  [ELoopstationEvents.INTERNALSTATE_CHANGE]: InternalState;
}

export enum ELoopstationActions {
  SET_MEASUREMENT = 'SET_MEASUREMENT',
  START_RECORDING = 'START_RECORDING',
  STOP_RECORDING = 'STOP_RECORDING',
}

export interface LoopstationActions {
  [ELoopstationActions.SET_MEASUREMENT]: PossibleMeasure;
  [ELoopstationActions.START_RECORDING]: void;
  [ELoopstationActions.STOP_RECORDING]: void;
}
