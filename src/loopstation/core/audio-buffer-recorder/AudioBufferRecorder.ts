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

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
    this.externalInput = this.audioCtx.createMediaStreamDestination();

    this.setup();
  }

  async setup() {
    const stream = await navigator.mediaDevices.getUserMedia(
      AudioBufferRecorder.CONSTRAINTS,
    );

    const streamSource = this.audioCtx.createMediaStreamSource(stream);

    streamSource.connect(this.externalInput);

    const mediaRecorder = new MediaRecorder(this.externalInput.stream);
    mediaRecorder.ondataavailable = e => {
      this.data.push(e.data);
    };
    this.mediaRecorder = mediaRecorder;
  }

  public getExternalInput() {
    return this.externalInput;
  }

  stop(): Promise<AudioBuffer> {
    return new Promise(resolve => {
      this.mediaRecorder.onstop = async () => {
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
