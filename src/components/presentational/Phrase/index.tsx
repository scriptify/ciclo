import React from 'react';
import classnames from 'classnames';

const effectsIcon = require('../../../img/effects.svg');
const trashIcon = require('../../../img/trash.svg');
const playIcon = require('../../../img/play.svg');
const pauseIcon = require('../../../img/pause.svg');

const {
  phraseContainer,
  togglePlayback,
  phraseName,
  phraseActions,
  phraseAction,
  isMuted: isMutedClass,
} = require('./index.css');

interface Props {
  onDelete: () => void;
  onEditEffects: () => void;
  onMute: () => void;
  name: string;
  isMuted: boolean;
}

const Phrase = ({
  onDelete,
  onEditEffects,
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
      className={classnames(togglePlayback, { [isMutedClass]: isMuted })}
      onClick={onMute}
    >
      {
        isMuted ? (
          <img src={playIcon} alt="Start playback" />
        ) : (
          <img src={pauseIcon} alt="Pause playback" />
        )
      }
    </div>
    <div className={phraseName}>{name}</div>
  </div>
);

export default Phrase;
