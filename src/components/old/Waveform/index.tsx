import React, { Component } from 'react';

interface Props {
  data: AudioBuffer;
}

interface State {
  canvasEl: HTMLCanvasElement | null;
}

export default class Waveform extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      canvasEl: null,
    };
    this.onCanvasRef = this.onCanvasRef.bind(this);
    this.drawCanvas = this.drawCanvas.bind(this);
  }

  drawCanvas(canvasEl = this.state.canvasEl) {
    if (canvasEl) {
      const { data } = this.props;
      if (!data) return;
      const leftChannelData = data.getChannelData(0);
      const canvasCtx = canvasEl.getContext('2d');
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      canvasCtx.fillStyle = 'rgb(255, 255, 255)';
      canvasCtx.fillRect(0, 0, canvasEl.width, canvasEl.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(168, 168, 168)';
      canvasCtx.beginPath();
      const sliceWidth = canvasEl.width * (1 / data.length);
      let x = 0;
      for (let i = 0; i < leftChannelData.length; i += 1) {
        const y = (leftChannelData[i] * canvasEl.height) + (canvasEl.height / 2);
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.lineTo(canvasEl.width, canvasEl.height / 2);
      canvasCtx.stroke();
    }
  }

  onCanvasRef(canvasEl: HTMLCanvasElement) {
    if (canvasEl) {
      this.setState({
        ...this.state,
        canvasEl,
      },            this.drawCanvas);
    }
  }

  render() {
    const { data, ...rest } = this.props;
    this.drawCanvas();
    return (
      <canvas {...rest}
        ref={this.onCanvasRef} style={{ width: '100%', height: '100%' }} />
    );
  }
}
