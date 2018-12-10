import React, { Component } from 'react';

import { recorder, isRecording as isRecordingClass, showMeasureEnd } from './index.css';

import Loopstation from '../../loopstation';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
      showMeasureEnd: false
    };
    this.loopstation = new Loopstation();
    this.toggleRecording = this.toggleRecording.bind(this);
    this.toggleRecordingState = this.toggleRecordingState.bind(this);
    this.showMeasureEnd = this.showMeasureEnd.bind(this);

    this.loopstation.addEventListener('recordingstart', this.toggleRecordingState);
    this.loopstation.addEventListener('recordingstop', this.toggleRecordingState);
    // this.loopstation.addEventListener('measureend', this.showMeasureEnd);
  }

  toggleRecordingState() {
    const isRecording = !this.state.isRecording;
    this.setState({
      ...this.state,
      isRecording
    });
  }

  showMeasureEnd() {
    this.setState({
      ...this.state,
      showMeasureEnd: true
    });
    setTimeout(() => {
      this.setState({
        ...this.state,
        showMeasureEnd: false
      });
    }, 300);
  }

  toggleRecording() {
    const isRecording = !this.state.isRecording;
    if (isRecording)
      this.loopstation.startRecording();
    else
      this.loopstation.stopRecording();
  }

  render() {
    return (
      <div>
        <button
          className={`${recorder}${this.state.isRecording ? ` ${isRecordingClass}` : ''}`}
          onClick={this.toggleRecording}
        />
        {
          this.state.showMeasureEnd && (
            <div className={showMeasureEnd} />
          )
        }
      </div>
    );
  }
}

export default App;
