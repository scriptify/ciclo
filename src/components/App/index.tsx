import React, { Component, ReactNode } from 'react';

import Loopstation from '../../loopstation/api/Loopstation';
import { RecordState, ELoopstationActions, GlobalState } from '../../loopstation/api';

const {
  recorder,
  isRecording: isRecordingClass,
  controls,
} = require('./index.css');

interface Props {

}

interface GlobalStateListenerProps {
  children: (g: GlobalState, loopstation: Loopstation) => ReactNode;
}

class GlobalStateListener extends Component<GlobalStateListenerProps, GlobalState> {
  private loopstation: Loopstation = new Loopstation();

  constructor(props: GlobalStateListenerProps) {
    super(props);
    this.state = this.loopstation.getCurrentState();
    this.loopstation.onStateChange(newGlobalState => this.setState(newGlobalState));
  }

  render() {
    return this.props.children(this.state, this.loopstation);
  }
}

const App = (p: Props) => {
  return (
    <GlobalStateListener>
      {
        (globalState, loopstation) => {
          console.log({ globalState });
          return (
            <div className={controls}>
              <div>
                <button
                  className={`
                    ${recorder}
                    ${
                      globalState.recordingState === RecordState.RECORDING
                        ? ` ${isRecordingClass}`
                        : ''
                    }
                  `}
                  onClick={() => {
                    if (globalState.recordingState === RecordState.IDLE) {
                      loopstation.action(ELoopstationActions.START_RECORDING);
                    } else {
                      loopstation.action(ELoopstationActions.STOP_RECORDING);
                    }
                  }}
                />
                <select
                  value={globalState.numMeasures}
                  onChange={(e) => {
                    loopstation.action(
                      ELoopstationActions.SET_MEASUREMENT,
                      parseFloat(e.target.value),
                    );
                  }}
                >
                  <option value={1}>1</option>
                  <option value={1 / 2}>1/2</option>
                  <option value={1 / 4}>1/4</option>
                  <option value={1 / 8}>1/8</option>
                </select>
              </div>
            </div>
          );
        }
      }
    </GlobalStateListener>
  );
};

export default App;
