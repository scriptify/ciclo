interface StateGroup {
  id: string;
  group: {
    masterChnl: SerializedChnl;
  };
}

interface StateRecording {
  id: string;
  recording: {
    groupId: string;
    bufferChnl: {
      chnl: SerializedChnl;
      duration: number;
      buffer: AudioBuffer | null;
    };
  };
}

interface TimingData {
  bpm: number;
  measureDuration: number;
}

interface SerializableLoopIoState {
  isRecording: boolean;
  activeGroup: string;
  timing: TimingData;
  groups: StateGroup[];
  recordings: StateRecording[];
  externalAudioModules: ExternalAudioModule[];
}

type LoopIoNodeType = 'master' | 'recording' | 'group';
