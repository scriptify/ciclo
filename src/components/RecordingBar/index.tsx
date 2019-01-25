import React, { useState, ChangeEvent } from 'react';
import { Observer } from 'mobx-react';

import classnames from 'classnames';
import withLoopIo, { WithLoopIo } from '../../loopstation/bindings/mobx';

const {
  recordingContainer,
  recordingContent,
  bpm,
  recordBtn,
  isRecording,
  measure,
} = require('./index.css');

interface Props {

}

const RecordingBar = (props: WithLoopIo<Props>) => {
  const [currentMeasure, setCurrentMeasure]  = useState<number>(1);

  const onMeasureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMeasure = parseFloat(e.target.value);
    setCurrentMeasure(newMeasure);
  };

  const { loopioState, loopio } = props;

  return (
    <Observer>
      {() => (
        <div className={recordingContainer}>
          <div className={recordingContent}>
            <p className={bpm}>120 bpm</p>
            <button
              className={classnames(recordBtn, { [isRecording]: loopioState.isRecording })}
              onClick={() => {
                loopio.toggleRecording({ numMeasures: currentMeasure });
              }}
            />
            <select className={measure} onChange={onMeasureChange} value={currentMeasure}>
              <option value={1}>1</option>
              <option value={1 / 2}>1/2</option>
              <option value={1 / 4}>1/4</option>
              <option value={1 / 8}>1/8</option>
            </select>
          </div>
        </div>
      )}
    </Observer>
  );
};

export default withLoopIo<Props>(RecordingBar);
