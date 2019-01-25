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

interface SerializableLoopIoState {
  isRecording: boolean;
  activeGroup: string;
  groups: StateGroup[];
  recordings: StateRecording[];
}
