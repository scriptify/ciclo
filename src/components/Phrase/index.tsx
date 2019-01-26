import React from 'react';

import ProgressRing from '../ProgressRing';

const effectsIcon = require('../../img/effects.svg');
const trashIcon = require('../../img/trash.svg');

const {
  phraseContainer,
  progressRing,
  phraseName,
  phraseActions,
  phraseAction,
} = require('./index.css');

const Phrase = () => (
  <div className={phraseContainer}>
    <div className={phraseActions}>
      <button className={phraseAction}>
        <img src={trashIcon} alt="Delete phrase" />
      </button>
      <button className={phraseAction}>
        <img src={effectsIcon} alt="Edit effects" />
      </button>
    </div>
    <div className={progressRing}>
      <ProgressRing progress={60} radius={30} stroke={5} color="rgb(0, 69, 158)" />
    </div>
    <div className={phraseName}>Phrase 1</div>
  </div>
);

export default Phrase;
