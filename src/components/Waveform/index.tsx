import React, { Component } from 'react';

const { waveformContainer } = require('./index.css');

interface Props {
  data: AudioBufferSourceNode;
  height: number;
  width: number;
}

export default class Waveform extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.onCanvasRef = this.onCanvasRef.bind(this);
  }

  onCanvasRef(canvasEl: HTMLCanvasElement) {
    if (canvasEl) {
      const { buffer: data } = this.props.data;
      if (!data) return;
      const leftChannelData = data.getChannelData(0);
      const canvasCtx = canvasEl.getContext('2d');
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, this.props.width, this.props.height);
      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, this.props.width, this.props.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx.beginPath();
      const sliceWidth = this.props.width * (1 / data.length);
      let x = 0;
      for (let i = 0; i < leftChannelData.length; i += 1) {
        const y = (leftChannelData[i] * this.props.height) + (this.props.height / 2);
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

  render() {
    const { data, ...rest } = this.props;
    return (
      <div className={waveformContainer}>
        <p>{data.buffer ? data.buffer.duration.toFixed(2) : 0}s</p>
        <canvas {...rest} ref={this.onCanvasRef} />
      </div>
    );
  }
}
