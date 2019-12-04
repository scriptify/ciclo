import EventEmitter from '../../util/EventEmitter';
import MeasureTimer from '../measure-timer/MeasureTimer';
import AudioBufferRecorder from '../audio-buffer-recorder/AudioBufferRecorder';
import {
  repeatBuffer,
  resizeAudioBuffer,
  getResizeFactor,
  fadeAudioBuffer,
  PHRASE_MIN_LONGER_THAN_FIRST_SAMPLE,
} from '../../util';
import AudioLooperVisualization from './AudioLooperVisualization';

interface StopRecordingParams {
  numMeasures?: number;
}

export default class AudioLooper extends EventEmitter {
  static MEASURE = 4;

  private audioCtx: AudioContext;
  private recorder: AudioBufferRecorder;
  private visualizer: AudioLooperVisualization;
  private measureDuration: number = 0;
  private bpm: number = 0;
  private clock: MeasureTimer | null = null;
  private audioBuffers: AudioBufferSourceNode[] = [];

  private firstTrackStartedAt: number = 0;

  constructor(audioCtx: AudioContext, recorder?: AudioBufferRecorder) {
    super();
    this.audioCtx = audioCtx;
    this.recorder = recorder || new AudioBufferRecorder(this.audioCtx);
    this.visualizer = new AudioLooperVisualization(this);
    this.visualizer.start();
  }

  private get currentMeasureOffset() {
    const offset =
      (this.audioCtx.currentTime - this.firstTrackStartedAt) %
      this.measureDuration;
    return offset;
  }

  startRecording() {
    const record = async () => {
      this.emit('recordingstart');
      /* const timeDiff = this.measureDuration - this.currentMeasureOffset;
      if (timeDiff <= 0.1) {
        this.recordingOffset = 0;
      } else {
        this.recordingOffset = this.currentMeasureOffset - (this.measureDuration / 16);
      }

      if (this.recordingOffset < 0) {
        this.recordingOffset = 0;
      } */
      await this.recorder.start();
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
    // Stopping immediately: new phrase will always be adjusted
    return this.stopRecordingImmediate(params);
    /* if (!this.bpm) {
      return this.stopRecordingImmediate(params);
    }

    return new Promise((resolve) => {
      this.onMeasureStart = async () => {
        this.onMeasureStart = () => {};
        await this.stopRecordingImmediate(params);
        resolve();
      };
    }); */
  }

  private async stopRecordingImmediate({ numMeasures = 1 } = {}) {
    console.time('start rec method');

    let newBuffer = await this.recorder.stop();

    const isFirstTrack = !this.measureDuration;
    if (isFirstTrack) {
      // First track
      this.measureDuration = newBuffer.duration * numMeasures ** -1;
      this.bpm = (AudioLooper.MEASURE * 60) / this.measureDuration;

      this.firstTrackStartedAt = this.audioCtx.currentTime;
      this.clock = new MeasureTimer({
        bpm: this.bpm,
        measure: AudioLooper.MEASURE,
        audioCtx: this.audioCtx,
      });
      this.emit('timingdataavailable', {
        bpm: this.bpm,
        measureDuration: this.measureDuration,
      });

      // this.clock.addEventListener('measurestart', () => this.onMeasureStart());

      if (numMeasures !== 1) {
        const REPEAT_TIMES = numMeasures ** -1;
        newBuffer = repeatBuffer({
          audioBuffer: newBuffer,
          audioCtx: this.audioCtx,
          times: REPEAT_TIMES,
        });
      }
    }

    fadeAudioBuffer(newBuffer);

    // Fill buffer to fit the length of one measure
    // Then start it with an offset of the original length
    const bufferOrigDuration = newBuffer.duration;
    const bufferNewLength = this.measureDuration * newBuffer.sampleRate;

    newBuffer = isFirstTrack
      ? newBuffer
      : resizeAudioBuffer({
          audioCtx: this.audioCtx,
          mode: 'after',
          audioBuffer: newBuffer,
          newLength: bufferNewLength,
        });

    const bufferNode = this.audioCtx.createBufferSource();
    bufferNode.loop = true;
    bufferNode.buffer = newBuffer;

    this.audioBuffers.push(bufferNode);

    const startAt = 0;
    const offset = bufferOrigDuration;

    console.log({
      bufferOrigDuration,
      newDuration: newBuffer.duration,
    });

    bufferNode.start(this.audioCtx.currentTime + startAt, offset);
    this.emit('recordingstop', bufferNode);
    console.timeEnd('start rec method');
  }

  public getClock() {
    return this.clock;
  }

  /** All data needed by AudioLooperVisualization */
  public getVisualizationData() {
    return {
      audioBuffers: this.audioBuffers,
      measureDuration: this.measureDuration,
      currentMeasureOffset: this.currentMeasureOffset,
    };
  }
}
