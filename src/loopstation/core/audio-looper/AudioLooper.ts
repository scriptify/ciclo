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
import { SavedAudioBufferData } from './types';

// Delay from Audio Interface -> Browser
const OS_DELAY = 0.19; // WIN
// const OS_DELAY = 0;

interface AddAudioBufferParams {
  buffer: AudioBuffer;
  numMeasures?: number;
}

interface StopRecordingParams {
  numMeasures?: number;
}

interface StopRecordingImmediateParams extends StopRecordingParams {
  providedAudioBuffer?: AudioBuffer;
}

export default class AudioLooper extends EventEmitter {
  static MEASURE = 4;

  private audioCtx: AudioContext;
  private recorder: AudioBufferRecorder;
  private visualizer?: AudioLooperVisualization;
  private measureDuration: number = 0;
  private bpm: number = 0;
  private clock: MeasureTimer | null = null;
  private audioBuffers: SavedAudioBufferData[] = [];

  private firstTrackStartedAt: number = 0;

  constructor(audioCtx: AudioContext, recorder?: AudioBufferRecorder) {
    super();
    this.audioCtx = audioCtx;
    this.recorder = recorder || new AudioBufferRecorder(this.audioCtx);
    // this.visualizer = new AudioLooperVisualization(this);
    // this.visualizer.start();
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

  public stopRecording(params: StopRecordingParams) {
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

  /**
   * Add an audio buffer directly to
   * the looper (insteas of recording one)
   */
  public addAudioBuffer({ buffer, numMeasures }: AddAudioBufferParams) {
    this.stopRecordingImmediate({ providedAudioBuffer: buffer, numMeasures });
  }

  private async stopRecordingImmediate({
    numMeasures = 1,
    providedAudioBuffer,
  }: StopRecordingImmediateParams = {}) {
    console.time('rectime');
    let newBuffer = providedAudioBuffer || (await this.recorder.stop());
    fadeAudioBuffer(newBuffer);

    fadeAudioBuffer(newBuffer);

    const isFirstTrack = !this.measureDuration;
    if (isFirstTrack) {
      // First track
      this.measureDuration = newBuffer.duration * numMeasures ** -1;
      this.bpm = (AudioLooper.MEASURE * 60) / this.measureDuration;

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
      this.firstTrackStartedAt = this.audioCtx.currentTime;
    }

    // Fill buffer to fit the length of one measure
    // Then start it with an offset of the original length
    const bufferOrigDuration = newBuffer.duration;
    const newDurationInSeconds =
      Math.ceil(bufferOrigDuration / this.measureDuration) *
      this.measureDuration;
    const bufferNewLength = newDurationInSeconds * newBuffer.sampleRate;

    newBuffer = isFirstTrack
      ? newBuffer
      : resizeAudioBuffer({
          audioCtx: this.audioCtx,
          offset: 0,
          audioBuffer: newBuffer,
          newLength: bufferNewLength,
        });

    const bufferNode = this.audioCtx.createBufferSource();
    bufferNode.buffer = newBuffer;
    bufferNode.loop = true;

    const startAt = 0;
    let offset = isFirstTrack ? 0 : bufferOrigDuration + OS_DELAY;
    console.log({ offset });

    bufferNode.start(this.audioCtx.currentTime + startAt, offset);
    this.audioBuffers.push({
      offset,
      audioBuffer: bufferNode,
      startedAt: startAt,
    });
    this.emit('recordingstop', bufferNode);
    console.timeEnd('rectime');
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
