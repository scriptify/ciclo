import React from 'react';

const effectsIcon = require('../../img/effects.svg');

const {
  barContainer,
  recordBtn,
  effectsBtn,
} = require('./index.css');

const TopBar = () => (
  <div className={barContainer}>
    <button className={recordBtn} />
    <button className={effectsBtn}>
      <img src={effectsIcon} alt="Edit effects" />
    </button>
  </div>
);

export default TopBar;
