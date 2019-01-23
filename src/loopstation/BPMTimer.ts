import EventEmitter from './util/EventEmitter';

interface BPMTimerConstructor {
  bpm: number;
  measure: number;
  audioCtx: AudioContext;
}

export default class BPMTimer extends EventEmitter {
  private measureLength: number;
  private loop: number = -1;
  private startedAt: number = 0;
  private audioCtx: AudioContext;

  constructor({ bpm, measure, audioCtx }: BPMTimerConstructor) {
    super();
    this.audioCtx = audioCtx;
    this.measureLength = measure / (bpm / 60);
    this.setup();
  }

  setup() {
    this.startedAt = this.audioCtx.currentTime;
    let lastMeasureStart = 0;
    this.loop = window.setInterval(() => {
      const offset = (
        (this.audioCtx.currentTime - this.startedAt)
        % this.measureLength
      ) / this.measureLength;
      this.emit('progress', offset);

      const currentMeasureNum = Math.floor(
        (this.audioCtx.currentTime - this.startedAt) / this.measureLength,
      );
      const isMeasureStart = currentMeasureNum > lastMeasureStart;
      if (isMeasureStart) {
        lastMeasureStart = currentMeasureNum;
        this.emit('measurestart');
      }
    },                             1000 / 60);
  }

  clear() {
    if (this.loop !== null && this.loop !== undefined) {
      clearInterval(this.loop);
    }
  }
}
