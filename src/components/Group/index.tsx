import React from 'react';
import withLoopIo, { WithLoopIo } from '../../loopstation/bindings/react';
import Recording from '../Recording';
import { isChnlMuted } from '../../util';

const {
  group: groupClass,
  groupHeader,
  headerAction,
  groupContent,
} = require('./index.css');

const pauseIcon = require('../../img/mute.svg');
const playIcon = require('../../img/unmute.svg');
const effectsIcon = require('../../img/effects.svg');

interface Props {
  id: string;
}

const Group = ({ id, loopioState, loopio }: WithLoopIo<Props>) => {
  const recordingsOfGroup = loopioState.recordings
    .filter(rec => rec.recording.groupId === id);

  const group = loopioState.groups.find(g => g.id === id);
  if (!group) {
    return <span>Group not found.</span>;
  }

  const isCurrentlyPaused = isChnlMuted(group.group.masterChnl.effects);
  return (
    <div className={groupClass}>
      <header className={groupHeader}>
        <button
          className={headerAction}
          onClick={() => {
            if (isCurrentlyPaused) {
              loopio.unmute('group', id);
            } else {
              loopio.mute('group', id);
            }
          }}
        >
          <img src={isCurrentlyPaused ? playIcon : pauseIcon} alt="Pause" />
        </button>
        <button className={headerAction}>
          <img src={effectsIcon} alt="Apply effects" />
        </button>
      </header>
      <div className={groupContent}>
        {
          recordingsOfGroup.map(rec => (
            <Recording key={rec.id} id={rec.id} />
          ))
        }
      </div>
    </div>
  );
};

export default withLoopIo<Props>(Group);
