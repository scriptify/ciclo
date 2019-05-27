import React from 'react';

const logoImg = require('../../../img/logo.png');

const { barContainer, logo } = require('./index.css');

interface Props {
  bpm: number;
}

const TopBar = ({ bpm }: Props) => (
  <div className={barContainer}>
    <div className={logo}>
      <img src={logoImg} alt="Ciclo Logo" />
    </div>
  </div>
);

export default TopBar;
