import React, { ChangeEvent } from 'react';
import classnames from 'classnames';

const volumeIcon = require('../../../img/volume.svg');

const {
  barContainer,
  recordBtn,
  toSpeakersBtn,
  measure,
  addGroupBtn,
  isRecording: isRecordingClass,
} = require('./index.css');

interface Props {
  isRecording: boolean;
  onRecordingToggle: () => void;
  onCreateNewGroup: () => void;
  currentMeasure: number;
  onMeasureChange: (m: number) => void;
  hideChangeMeasure: boolean;
}

const BottomBar = ({
  currentMeasure,
  onMeasureChange: onMeasureChangeProp,
  onRecordingToggle,
  onCreateNewGroup,
  hideChangeMeasure,
  isRecording,
}: Props) => {
  const onMeasureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMeasure = parseFloat(e.target.value);
    onMeasureChangeProp(newMeasure);
  };

  return (
    <div className={barContainer}>
      <button className={toSpeakersBtn}>
        <img src={volumeIcon} alt="Redirect mic input to speakers" />
      </button>
      {
        !hideChangeMeasure && (
          <select
            className={measure}
            value={currentMeasure}
            onChange={onMeasureChange}
          >
            <option value={1}>1</option>
            <option value={1 / 2}>1/2</option>
            <option value={1 / 4}>1/4</option>
            <option value={1 / 8}>1/8</option>
          </select>
        )
      }
      <button
        className={classnames(recordBtn, { [isRecordingClass]: isRecording })}
        onClick={onRecordingToggle}
      />
      <button className={addGroupBtn} onClick={onCreateNewGroup}>+</button>
    </div>
  );
};

export default BottomBar;
