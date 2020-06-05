import React, { ChangeEvent } from 'react';
import classnames from 'classnames';
import ProgressRing from '../ProgressRing';

const synthIcon = require('../../../img/synth.png');

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
  onOpenAudioModulesList: () => void;
  onFileDropped: (file: File) => void;
  hideChangeMeasure: boolean;
  bpm: number;
  measureProgress: number;
}

const BottomBar = ({
  currentMeasure,
  onMeasureChange: onMeasureChangeProp,
  onRecordingToggle,
  onCreateNewGroup,
  onOpenAudioModulesList,
  hideChangeMeasure,
  isRecording,
  bpm,
  measureProgress,
  onFileDropped,
}: Props) => {
  const onMeasureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMeasure = parseFloat(e.target.value);
    onMeasureChangeProp(newMeasure);
  };

  async function onFilesDrop(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('onFilesDrop', e.target.files);
    const [file] = e.target.files || [];
    if (file) {
      onFileDropped(file);
    }
  }

  return (
    <div className={barContainer}>
      <input
        type="file"
        className={toSpeakersBtn}
        onChange={onFilesDrop}
        accept="audio/*"
      >
        {/* <img src={synthIcon} alt="External Audio Modules (synths)" /> */}
      </input>
      {!hideChangeMeasure && (
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
      )}
      <button
        className={classnames(recordBtn, { [isRecordingClass]: isRecording })}
        onClick={onRecordingToggle}
      >
        <ProgressRing
          progress={measureProgress ? measureProgress : 100}
          radius={27}
          stroke={3}
          color="#00B9FF"
        />
        {bpm !== 0 && <span>{bpm.toFixed()} BPM</span>}
      </button>
      <button className={addGroupBtn} onClick={onCreateNewGroup}>
        +
      </button>
    </div>
  );
};

export default BottomBar;
