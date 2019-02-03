import React, { ChangeEvent } from 'react';
import classnames from 'classnames';
import ProgressRing from '../ProgressRing';

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
  bpm: number;
  measureProgress: number;
}

const BottomBar = ({
  currentMeasure,
  onMeasureChange: onMeasureChangeProp,
  onRecordingToggle,
  onCreateNewGroup,
  hideChangeMeasure,
  isRecording,
  bpm,
  measureProgress,
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
      >
        <ProgressRing
          progress={measureProgress ? measureProgress : 100}
          radius={30}
          stroke={5}
          color="rgb(0, 69, 158)"
        />
        {
          bpm !== 0 && (
            <span>{bpm.toFixed()} BPM</span>
          )
        }
      </button>
      <button className={addGroupBtn} onClick={onCreateNewGroup}>+</button>
    </div>
  );
};

export default BottomBar;
