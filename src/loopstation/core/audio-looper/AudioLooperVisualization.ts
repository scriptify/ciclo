import AudioLooper from './AudioLooper';
import { SavedAudioBufferData } from './types';

interface AudioBufferVisualizationData {
  audioBuffers: SavedAudioBufferData[];
  percentualProgress: number;
}

function getRandomColor() {
  const ranNum = () => 255 * Math.random();
  return `rgba(${ranNum()}, ${ranNum()}, ${ranNum()}, 0.5)`;
}

/**
 * Visualize multiple audio buffers
 */
class AudioBufferVisualization {
  private availableColors: string[];
  private canvas!: HTMLCanvasElement;
  private visualizationData: AudioBufferVisualizationData;

  constructor() {
    this.visualizationData = {
      audioBuffers: [],
      percentualProgress: 0,
    };
    this.availableColors = Array(100)
      .fill(true)
      .map(getRandomColor);
    this.setup();
  }

  private setup() {
    const CANVAS_HEIGHT = 200;
    const canvasId = `bufferCanvas`;
    const containerHtml = `
        <div style="position: absolute; right: 0; top: 0px; width: 40%; height: ${CANVAS_HEIGHT}px;">
          <canvas style="width: 100%; height: 100%" id="${canvasId}" />
        </div>
      `;
    document.body.insertAdjacentHTML('beforeend', containerHtml);
    const canvasEl = document.querySelector<HTMLCanvasElement>(`#${canvasId}`);
    this.canvas = canvasEl as HTMLCanvasElement;
    const context = this.canvas.getContext('2d');
    if (!context) return;

    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * devicePixelRatio);
    this.canvas.height = Math.floor(rect.height * devicePixelRatio);
  }

  private drawAudioBuffers() {
    const resolution = 50;

    const context = this.canvas.getContext('2d');
    if (!context) return;

    this.visualizationData.audioBuffers.forEach((buffer, i) => {
      const audioBufferData = buffer.audioBuffer.buffer;
      if (!audioBufferData) return;
      let data = audioBufferData.getChannelData(0);
      context.fillStyle = this.availableColors[i];
      for (let i = 0; i < this.canvas.width; i++) {
        let max = -Infinity;
        let min = Infinity;
        const start = Math.floor((i / this.canvas.width) * data.length);
        const end = Math.floor(((i + 1) / this.canvas.width) * data.length);
        const interval = Math.floor((end - start) / resolution) || 1;
        for (let j = start; j <= end; j += interval) {
          const item = data[j];
          if (max < item) max = item;
          if (min > item) min = item;
        }
        const height = ((max - min) / 2) * this.canvas.height;
        const startPixel = (1 - (max + 1) / 2) * this.canvas.height;
        context.fillRect(i, startPixel, 1, height);
      }
    });
  }

  private drawTimePointer() {
    const context = this.canvas.getContext('2d');
    if (!context) return;
    const xPos = this.canvas.width * this.visualizationData.percentualProgress;
    context.fillStyle = 'red';
    context.fillRect(xPos, 0, 2, this.canvas.height);
  }

  private draw() {
    const context = this.canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawAudioBuffers();
    this.drawTimePointer();
  }

  public update(data: AudioBufferVisualizationData) {
    this.visualizationData = data;
    this.draw();
  }
}

export default class AudioLooperVisualization {
  private audioLooper: AudioLooper;
  private audioBufferVisualization: AudioBufferVisualization;

  constructor(audioLooper: AudioLooper) {
    this.audioLooper = audioLooper;
    this.audioBufferVisualization = new AudioBufferVisualization();
  }

  public start() {
    window.requestAnimationFrame(this.draw.bind(this));
  }

  private draw() {
    const {
      audioBuffers,
      measureDuration,
      currentMeasureOffset,
    } = this.audioLooper.getVisualizationData();

    this.audioBufferVisualization.update({
      audioBuffers,
      percentualProgress: currentMeasureOffset / measureDuration,
    });

    window.requestAnimationFrame(this.draw.bind(this));
  }
}
