import React from 'react';
import classnames from 'classnames';

import ProgressRing from '../ProgressRing';

const effectsIcon = require('../../../img/effects.svg');
const trashIcon = require('../../../img/trash.svg');

const {
  phraseContainer,
  progressRing,
  phraseName,
  phraseActions,
  phraseAction,
  isMuted: isMutedClass,
} = require('./index.css');

interface Props {
  onDelete: () => void;
  onEditEffects: () => void;
  onMute: () => void;
  progress: number;
  name: string;
  isMuted: boolean;
}

const Phrase = ({
  onDelete,
  onEditEffects,
  progress,
  name,
  isMuted,
  onMute,
}: Props) => (
  <div className={phraseContainer}>
    <div className={phraseActions}>
      <button className={phraseAction} onClick={onDelete}>
        <img src={trashIcon} alt="Delete phrase" />
      </button>
      <button className={phraseAction} onClick={onEditEffects}>
        <img src={effectsIcon} alt="Edit effects" />
      </button>
    </div>
    <div
      className={classnames(progressRing, { [isMutedClass]: isMuted })}
      onClick={onMute}
    >
      <ProgressRing progress={progress} radius={30} stroke={5} color="rgb(0, 69, 158)" />
    </div>
    <div className={phraseName}>{name}</div>
  </div>
);

export default Phrase;
