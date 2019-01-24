interface SerializableLoopIoState {
  isRecording: boolean;
  activeGroup: string;
  groups: {
      id: string;
      group: {
          masterChnl: SerializedChnl;
      };
  }[];
  recordings: {
      id: string;
      recording: {
          groupId: string;
          bufferChnl: {
              chnl: SerializedChnl;
              buffer: AudioBuffer | null;
          };
      };
  }[];
}
