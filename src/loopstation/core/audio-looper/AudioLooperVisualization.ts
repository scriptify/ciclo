import AudioLooper from './AudioLooper';

function drawAudio(canvas: HTMLCanvasElement, buffer: AudioBuffer) {
  const resolution = 50;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);
  const context = canvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  let data = buffer.getChannelData(0);
  context.fillStyle = '#000';
  for (let i = 0; i < canvas.width; i++) {
    let max = -Infinity;
    let min = Infinity;
    const start = Math.floor((i / canvas.width) * data.length);
    const end = Math.floor(((i + 1) / canvas.width) * data.length);
    const interval = Math.floor((end - start) / resolution) || 1;
    for (let j = start; j <= end; j += interval) {
      const item = data[j];
      if (max < item) max = item;
      if (min > item) min = item;
    }
    const height = ((max - min) / 2) * canvas.height;
    const startPixel = (1 - (max + 1) / 2) * canvas.height;
    context.fillRect(i, startPixel, 1, height);
  }
}

function drawTimePointer(
  canvas: HTMLCanvasElement,
  percentualProgress: number,
) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const xPos = canvas.width * percentualProgress;
  context.fillStyle = 'red';
  context.fillRect(xPos, 0, 2, canvas.height);
}

export default class AudioLooperVisualization {
  private audioLooper: AudioLooper;

  constructor(audioLooper: AudioLooper) {
    this.audioLooper = audioLooper;
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
    audioBuffers.forEach((audioBuffer, i) => {
      if (audioBuffer.buffer) {
        const CANVAS_HEIGHT = 200;
        const canvasId = `bufferCanvas_${i}`;
        const containerHtml = `
        <div style="position: absolute; right: 0; top: ${CANVAS_HEIGHT *
          i}px; width: 40%; height: ${CANVAS_HEIGHT}px;">
          <canvas style="width: 100%; height: 100%" id="${canvasId}" />
        </div>
      `;
        document.body.insertAdjacentHTML('beforeend', containerHtml);
        const canvasEl = document.querySelector<HTMLCanvasElement>(
          `#${canvasId}`,
        );
        if (!canvasEl) return;
        drawAudio(canvasEl, audioBuffer.buffer);
        const percentualProgress = currentMeasureOffset / measureDuration;
        drawTimePointer(canvasEl, percentualProgress);
      }
    });
    window.requestAnimationFrame(this.draw.bind(this));
  }
}
