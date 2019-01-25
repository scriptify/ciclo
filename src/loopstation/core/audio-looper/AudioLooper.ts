import EventEmitter from '../../util/EventEmitter';
import MeasureTimer from '../measure-timer/MeasureTimer';
import AudioBufferRecorder from '../audio-buffer-recorder/AudioBufferRecorder';
import { repeatBuffer, prepareAudioBuffer, resizeAudioBuffer, getResizeFactor } from '../../util';

interface StopRecordingParams {
  numMeasures?: number;
}

export default class AudioLooper extends EventEmitter {
  static MEASURE = 4;

  private audioCtx: AudioContext;
  private recorder: AudioBufferRecorder;
  private measureDuration: number = 0;
  private recordingOffset: number = 0;
  private bpm: number = 0;
  private clock: MeasureTimer | null = null;
  private audioBuffers: AudioBufferSourceNode[] = [];

  private firstTrackStartedAt: number = 0;
  private onMeasureStart = () => {};

  constructor(audioCtx: AudioContext) {
    super();
    this.audioCtx = audioCtx;
    this.recorder = new AudioBufferRecorder(this.audioCtx);
  }

  private get currentMeasureOffset() {
    const offset = (
      (this.audioCtx.currentTime - this.firstTrackStartedAt)
      % this.measureDuration
    );
    return offset;
  }

  startRecording() {
    const record = async () => {
      this.emit('recordingstart');
      await this.recorder.start();
      const timeDiff = this.measureDuration - this.currentMeasureOffset;
      if (timeDiff <= 0.1) {
        this.recordingOffset = 0;
      } else {
        this.recordingOffset = this.currentMeasureOffset - (this.measureDuration / 16);
      }

      if (this.recordingOffset < 0) {
        this.recordingOffset = 0;
      }
    };
    return record();
    /* if (this.bpm === null)
      return record(); // First track
    return new Promise((resolve) => {
      this.onMeasureStart = async () => {
        this.onMeasureStart = () => {};
        await record();
        resolve();
      };
    }); */
  }

  stopRecording(params: StopRecordingParams) {
    if (!this.bpm) {
      return this.stopRecordingImmediate(params);
    }

    return new Promise((resolve) => {
      this.onMeasureStart = async () => {
        this.onMeasureStart = () => {};
        await this.stopRecordingImmediate(params);
        resolve();
      };
    });
  }

  private async stopRecordingImmediate({ numMeasures = 1 } = {}) {
    let newBuffer = await this.recorder.stop();

    const isFirstTrack = !this.measureDuration;
    if (isFirstTrack) {
      // First track
      this.measureDuration = newBuffer.duration * (numMeasures ** -1);
      this.bpm = (AudioLooper.MEASURE * 60) / this.measureDuration;

      this.firstTrackStartedAt = this.audioCtx.currentTime;
      this.clock = new MeasureTimer({
        bpm: this.bpm,
        measure: AudioLooper.MEASURE,
        audioCtx: this.audioCtx,
      });
      this.emit('timingdataavailable', { bpm: this.bpm, measureDuration: this.measureDuration });
      this.clock.addEventListener('measurestart', () => this.onMeasureStart());

      if (numMeasures !== 1) {
        const REPEAT_TIMES = numMeasures ** -1;
        newBuffer = repeatBuffer({
          audioBuffer: newBuffer,
          audioCtx: this.audioCtx,
          times: REPEAT_TIMES,
        });
      }
    }

    prepareAudioBuffer(newBuffer);

    // First append empty samples in the beginning according to when the recording was started
    const newSizeWithoutStartOffset = (this.recordingOffset + newBuffer.duration);
    const newSizeFactor = newSizeWithoutStartOffset / newBuffer.duration;
    const newSizeWithoutStartOffsetSamples = Math.floor(newBuffer.length * newSizeFactor);
    newBuffer = isFirstTrack ? newBuffer : resizeAudioBuffer({
      audioCtx: this.audioCtx,
      audioBuffer: newBuffer,
      newLength: newSizeWithoutStartOffsetSamples,
      mode: 'before',
    });

    const resizeFactor = getResizeFactor(this.measureDuration, newBuffer.duration);

    newBuffer = resizeAudioBuffer({
      audioCtx: this.audioCtx,
      audioBuffer: newBuffer,
      newLength: Math.floor(newBuffer.length * resizeFactor),
    });

    const bufferNode = this.audioCtx.createBufferSource();
    bufferNode.loop = true;
    bufferNode.buffer = newBuffer;

    this.audioBuffers.push(bufferNode);

    /* const startOffset = this.audioCtx.currentTime +
      (this.measureDuration - this.currentMeasureOffset); */

    const timeDiff = this.measureDuration - this.currentMeasureOffset;
    let startOffset = this.currentMeasureOffset;
    let startAt = 0;

    if (timeDiff <= 0.1) {
      startOffset = 0;
      startAt = this.audioCtx.currentTime +
        (this.measureDuration - this.currentMeasureOffset);
    }

    bufferNode.start(startAt, startOffset);
    this.emit('recordingstop', bufferNode);
  }

  public getClock() {
    return this.clock;
  }
}
