import EventEmitter from './EventEmitter';

function audioDataToBuffer(audioCtx, data) {
  return new Promise((resolve) => {
    const blob = new Blob(data, { type: 'audio/ogg; codecs=opus' });
    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', async () => {
      const decodedData = await audioCtx.decodeAudioData(fileReader.result);
      resolve(decodedData);
    });
    fileReader.readAsArrayBuffer(blob);
  });
}

class AudioBufferRecorder {
  static CONSTRAINTS = {
    audio: true,
    latency: 0,
    echoCancellation: false,
    noiseSuppression: false,
    volume: 1
  };
  data = [];

  constructor(audioCtx) {
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

  stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const bufferSource = audioDataToBuffer(this.audioCtx, this.data);
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

class BPMTimer extends EventEmitter {
  measureLength = null;
  loop = null;
  startedAt;

  constructor({ bpm, measure, audioCtx }) {
    super();
    this.audioCtx = audioCtx;
    this.measureLength = measure / (bpm / 60);
    this.setup();
  }

  setup() {
    this.startedAt = this.audioCtx.currentTime;
    let lastMeasureStart = 0;
    this.loop = setInterval(() => {
      const offset = (
        (this.audioCtx.currentTime - this.startedAt)
        % this.measureLength
      ) / this.measureLength;
      this.emit('progress', offset);

      const currentMeasureNum = Math.floor(
        (this.audioCtx.currentTime - this.startedAt) / this.measureLength
      );
      const isMeasureStart = currentMeasureNum > lastMeasureStart;
      if (isMeasureStart) {
        lastMeasureStart = currentMeasureNum;
        this.emit('measurestart');
      }
    }, 1000 / 60);
  }

  clear() {
    if (this.loop !== null && this.loop !== undefined)
      clearInterval(this.loop);
  }
}

function prepareAudioBuffer(audioBuffer) {
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    const FADE_LENGTH = 100;
    for (let i = 0; i < FADE_LENGTH && i < channelData.length; i += 1) {
      const fadeOutPos = channelData.length - i - 1;
      channelData[i] = (channelData[i] * i) / FADE_LENGTH;
      channelData[fadeOutPos] = (channelData[fadeOutPos] * i) / FADE_LENGTH;
    }
  }
}

function getResizeFactor(firstSampleLength, newSampleLength) {
  return (
    (Math.ceil(newSampleLength / firstSampleLength) * firstSampleLength)
    / newSampleLength
  );
}

function resizeAudioBuffer({
  audioCtx,
  audioBuffer,
  newLength,
  mode = 'after'
}) {
  if (audioBuffer.length === newLength)
    return audioBuffer;

  const newAudioBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels, newLength, audioBuffer.sampleRate
  );

  const setOffset = (mode === 'after' || newLength < audioBuffer.sampleRate) ? 0 : newLength - audioBuffer.length;

  for (let channel = 0; channel < newAudioBuffer.numberOfChannels; channel += 1)
    newAudioBuffer.copyToChannel(audioBuffer.getChannelData(channel), channel, setOffset);

  return newAudioBuffer;
}

function repeatBuffer({ audioBuffer, audioCtx, times }) {
  const newBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels, audioBuffer.length * times, audioBuffer.sampleRate
  );

  for (let currOffset = 0; currOffset < newBuffer.length; currOffset += audioBuffer.length) {
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel += 1)
      newBuffer.copyToChannel(audioBuffer.getChannelData(channel), channel, currOffset);
  }
  return newBuffer;
}

export default class Loopstation extends EventEmitter {
  static MEASURE = 4;
  bpm = null;
  measureDuration = null;
  clock = null;
  firstTrackStartedAt = 0;
  startedRecordingAt = 0;
  onMeasureStart = () => {};

  audioBuffers = [];

  constructor() {
    super();
    this.audioCtx = new AudioContext();
    this.recorder = new AudioBufferRecorder(this.audioCtx);
  }

  get currentMeasureOffset() {
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
      this.recordingOffset = this.currentMeasureOffset - (this.measureDuration / 16);
      if (this.recordingOffset < 0)
        this.recordingOffset = 0;
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

  stopRecording(params) {
    if (this.bpm === null)
      return this.stopRecordingImmediate(params);

    return new Promise((resolve) => {
      this.onMeasureStart = async () => {
        this.onMeasureStart = () => {};
        await this.stopRecordingImmediate(params);
        resolve();
      };
    });
  }

  async stopRecordingImmediate({ numMeasures = 1 } = {}) {
    let newBuffer = await this.recorder.stop();

    const isFirstTrack = !this.measureDuration;
    if (isFirstTrack) {
      // First track
      this.measureDuration = newBuffer.duration * (numMeasures ** -1);
      this.bpm = (Loopstation.MEASURE * 60) / this.measureDuration;
      console.log({ bpm: this.bpm });
      this.firstTrackStartedAt = this.audioCtx.currentTime;
      this.clock = new BPMTimer({
        bpm: this.bpm,
        measure: Loopstation.MEASURE,
        audioCtx: this.audioCtx
      });
      this.clock.addEventListener('progress', d => this.emit('progress', d));
      this.clock.addEventListener('measurestart', () => this.onMeasureStart());

      if (numMeasures !== 1) {
        const REPEAT_TIMES = numMeasures ** -1;
        newBuffer = repeatBuffer({
          audioBuffer: newBuffer, audioCtx: this.audioCtx, times: REPEAT_TIMES
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
      mode: 'before'
    });

    const resizeFactor = getResizeFactor(this.measureDuration, newBuffer.duration);

    newBuffer = resizeAudioBuffer({
      audioCtx: this.audioCtx,
      audioBuffer: newBuffer,
      newLength: Math.floor(newBuffer.length * resizeFactor)
    });

    const bufferNode = this.audioCtx.createBufferSource();
    bufferNode.loop = true;
    bufferNode.buffer = newBuffer;


    bufferNode.connect(this.audioCtx.destination);

    bufferNode.id = Math.random();
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
    this.emit('recordingstop');
  }
}
