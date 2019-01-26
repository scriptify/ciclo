import React from 'react';

const volumeIcon = require('../../img/volume.svg');

const {
  barContainer,
  recordBtn,
  toSpeakersBtn,
  measure,
  addGroupBtn,
} = require('./index.css');

const BottomBar = () => (
  <div className={barContainer}>
    <button className={toSpeakersBtn}>
      <img src={volumeIcon} alt="Redirect mic input to speakers" />
    </button>
    <select className={measure}>
      <option value={1}>1</option>
      <option value={1 / 2}>1/2</option>
      <option value={1 / 4}>1/4</option>
      <option value={1 / 8}>1/8</option>
    </select>
    <button className={recordBtn} />
    <button className={addGroupBtn}>+</button>
  </div>
);

export default BottomBar;
