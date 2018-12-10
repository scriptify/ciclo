import EventEmitter from './EventEmitter';

function audioDataToBuffer(audioCtx, data) {
  return new Promise((resolve) => {
    const blob = new Blob(data, { type: 'audio/ogg; codecs=opus' });
    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', async () => {
      const decodedData = await audioCtx.decodeAudioData(fileReader.result);
      const bufferNode = audioCtx.createBufferSource();
      bufferNode.buffer = decodedData;
      resolve(bufferNode);
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
  startedRecordingAt = 0;

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

/* class BPMTimer extends EventEmitter {
  // Sends notification on each measure

  measureLength = null;
  loop = null;

  constructor({ bpm, measure, audioCtx }) {
    super();
    this.audioCtx = audioCtx;
    this.measureLength = measure / (bpm / 60);
    this.setup();
  }

  setup() {
    let lastEventSentAt = null;
    this.loop = setInterval(() => {
      const isMeasureEnd = lastEventSentAt
        && this.audioCtx.currentTime >= (lastEventSentAt + this.measureLength)
        && lastEventSentAt !== this.audioCtx.currentTime;
      if (isMeasureEnd) {
        lastEventSentAt = this.audioCtx.currentTime;
        console.log('end');
        this.emit('measureend');
      }
    }, 1000 / 60);
  }

  clear() {
    if (this.loop !== null && this.loop !== undefined)
      clearInterval(this.loop);
  }
} */

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

function getPlaybackRate(firstSampleLength, newSampleLength) {
  return (
    (Math.ceil(newSampleLength / firstSampleLength) * firstSampleLength)
    / newSampleLength
  ) ** -1;
}

export default class Loopstation extends EventEmitter {
  static MEASURE = 4;
  bpm = null;
  measureDuration = null;
  clock = null;
  firstTrackStartedAt = 0;

  constructor() {
    super();
    this.audioCtx = new AudioContext();
    this.recorder = new AudioBufferRecorder(this.audioCtx);
  }

  async startRecording() {
    this.emit('recordingstart');
    await this.recorder.start();
  }

  async stopRecording() {
    const newBuffer = await this.recorder.stop();
    newBuffer.loop = true;
    newBuffer.connect(this.audioCtx.destination);

    if (this.bpm === null) {
      // First track
      this.measureDuration = newBuffer.buffer.duration;
      this.bpm = (Loopstation.MEASURE / this.measureDuration) * 60;
      console.log({ bpm: this.bpm });
      this.firstTrackStartedAt = this.audioCtx.currentTime;
      /* this.clock = new BPMTimer({
        bpm: this.bpm, measure: this.MEASURE, audioCtx: this.audioCtx
      });
      this.clock.addEventListener('measureend', () => this.emit('measureend')); */
    }

    const playbackRate = getPlaybackRate(this.measureDuration, newBuffer.buffer.duration);
    const startOffset = (
      (this.audioCtx.currentTime - this.firstTrackStartedAt)
      % this.measureDuration
    );

    console.log({
      measure: this.measureDuration,
      newDuration: newBuffer.buffer.duration * (playbackRate ** -1),
      modulo: (newBuffer.buffer.duration * (playbackRate ** -1)) % this.measureDuration,
      startOffset,
      playbackRate
    });


    newBuffer.playbackRate.value = playbackRate;
    prepareAudioBuffer(newBuffer);
    newBuffer.start(0, startOffset);
    this.emit('recordingstop');
  }
}
