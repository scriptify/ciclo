import React from 'react';

const effectsIcon = require('../../../img/effects.svg');

const {
  barContainer,
  recordBtn,
  effectsBtn,
  left,
  right,
} = require('./index.css');

interface Props {
  bpm: number;
}

const TopBar = ({ bpm }: Props) => (
  <div className={barContainer}>
    <div className={left}>
      <button className={recordBtn} />
      <button className={effectsBtn}>
        <img src={effectsIcon} alt="Edit effects" />
      </button>
    </div>
    <div className={right}>
      {
        bpm !== 0 && (
          <span>{bpm.toFixed()} BPM</span>
        )
      }
    </div>
  </div>
);

export default TopBar;
