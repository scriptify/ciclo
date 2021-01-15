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
  const onMeasureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMeasure = parseFloat(e.target.value || '1');
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
      {/* <button className={toSpeakersBtn}>
        <img
          src={synthIcon}
          alt="External Audio Modules (synths)"
          onClick={onOpenAudioModulesList}
        />
      </button> */}
      <input
        type="file"
        className={toSpeakersBtn}
        onChange={onFilesDrop}
        accept="audio/*"
      />
      {!hideChangeMeasure && (
        <input
          className={measure}
          value={currentMeasure}
          type="number"
          onChange={onMeasureChange}
          step={0.125}
          min={0.125}
        />
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
