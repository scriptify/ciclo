import { audioDataToBuffer } from './util';

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

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
    this.setup();
  }

  async setup() {
    const stream = await navigator.mediaDevices.getUserMedia(AudioBufferRecorder.CONSTRAINTS);
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      this.data.push(e.data);
    };
    this.mediaRecorder = mediaRecorder;
  }

  stop(): Promise<AudioBuffer> {
    return new Promise((resolve) => {
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
