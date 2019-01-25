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
            buffer: AudioBuffer | null;
        };
    };
}

interface TimingData { bpm: number; measureDuration: number; }

interface SerializableLoopIoState {
  isRecording: boolean;
  activeGroup: string;
  timing: TimingData;
  groups: StateGroup[];
  recordings: StateRecording[];
}
