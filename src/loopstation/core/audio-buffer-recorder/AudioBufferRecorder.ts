import { audioDataToBuffer } from '../../util';

export default class AudioBufferRecorder {
  static CONSTRAINTS = {
    audio: true,
    latency: 0,
    echoCancellation: false,
    noiseSuppression: false,
    volume: 1,
  };

  private data: Blob[] = [];
  private audioCtx: AudioContext;
  private mediaRecorder!: MediaRecorder;
  private externalInput: MediaStreamAudioDestinationNode;
  private streamSource?: MediaStreamAudioSourceNode;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;

    this.externalInput = this.audioCtx.createMediaStreamDestination();

    this.setup();
  }

  async setup() {
    const stream = await navigator.mediaDevices.getUserMedia(
      AudioBufferRecorder.CONSTRAINTS,
    );

    this.streamSource = this.audioCtx.createMediaStreamSource(stream);

    const mediaRecorder = new MediaRecorder(this.streamSource.mediaStream);
    mediaRecorder.ondataavailable = e => {
      this.data.push(e.data);
    };
    this.mediaRecorder = mediaRecorder;
  }

  public getExternalInput() {
    // Create new media recorder with external input is needed
    //     and something signal producing connects to it
    // Because if connected immediately, weird bugs occur
    if (this.streamSource) {
      this.streamSource.connect(this.externalInput);

      const mediaRecorder = new MediaRecorder(this.externalInput.stream);
      mediaRecorder.ondataavailable = e => {
        this.data.push(e.data);
      };
      this.mediaRecorder = mediaRecorder;
    }

    return this.externalInput;
  }

  stop(): Promise<AudioBuffer> {
    return new Promise(resolve => {
      this.mediaRecorder.onstop = async () => {
        console.log('data', this.data[0].size);
        const bufferSource = await audioDataToBuffer(this.audioCtx, this.data);
        resolve(bufferSource);
        this.data = [];
      };
      this.mediaRecorder.stop();
    });
  }

  start() {
    this.mediaRecorder.start();
  }
}
