import React, { Component } from 'react';

import { recorder, isRecording as isRecordingClass, progressBar, controls, waitingForRecording } from './index.css';

import Loopstation from '../../loopstation';
import Waveform from '../Waveform';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
      showMeasureEnd: false,
      waitingForRecording: false,
      progress: 0,
      waveformData: [],
      numMeasures: 1
    };
    this.loopstation = new Loopstation();
    this.toggleRecording = this.toggleRecording.bind(this);
    this.toggleRecordingState = this.toggleRecordingState.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onMeasureChange = this.onMeasureChange.bind(this);

    this.loopstation.addEventListener('recordingstart', this.toggleRecordingState);
    this.loopstation.addEventListener('recordingstop', this.toggleRecordingState);
    this.loopstation.addEventListener('progress', this.onProgress);
  }

  toggleRecordingState() {
    const isRecording = !this.state.isRecording;
    this.setState({
      ...this.state,
      isRecording,
      waitingForRecording: false,
      waveformData: this.loopstation.audioBuffers
    });
  }

  onProgress(progress) {
    this.setState({
      ...this.state,
      progress
    });
  }

  toggleRecording() {
    const isRecording = !this.state.isRecording;
    if (isRecording) {
      this.setState({
        ...this.state,
        waitingForRecording: true
      });
      this.loopstation.startRecording();
    } else
      this.loopstation.stopRecording({ numMeasures: this.state.numMeasures });
  }

  onMeasureChange(e) {
    this.setState({
      ...this.state,
      numMeasures: e.target.value
    });
  }

  render() {
    const currProgress = (
      (this.state.progress % this.state.numMeasures) * 100 * (this.state.numMeasures ** -1)
    );

    return (
      <div className={controls}>
        <div>
          <button
            className={`
              ${recorder}
              ${this.state.isRecording ? ` ${isRecordingClass}` : ''}
              ${this.state.waitingForRecording ? ` ${waitingForRecording}` : ''}
            `}
            onClick={this.toggleRecording}
          />
          <select value={this.state.numMeasures} onChange={this.onMeasureChange}>
            <option value={1}>1</option>
            <option value={1 / 2}>1/2</option>
            <option value={1 / 4}>1/4</option>
            <option value={1 / 8}>1/8</option>
          </select>
          <div
            className={progressBar}
            style={{
              width: `${currProgress}%`
            }}
          />
          <span>{Math.round(currProgress)}%</span>
        </div>
        {
          this.state.waveformData.map(data =>
            <Waveform key={data.id} height={80} width={200} data={data} />)
        }
      </div>
    );
  }
}

export default App;
