import React from 'react';
import withLoopIo, { WithLoopIo } from '../../loopstation/bindings/react';
import Waveform from '../Waveform';
import { isChnlMuted } from '../../util';

const {
  phrase: phraseClass,
  phraseAction,
  phraseWaveform,
} = require('./index.css');

const pauseIcon = require('../../img/pause.svg');
const playIcon = require('../../img/play.svg');
const effectsIcon = require('../../img/effects.svg');

interface Props {
  id: string;
}

const Recording = ({ id, loopioState, loopio }: WithLoopIo<Props>) => {

  const phrase = loopioState.recordings.find(rec => rec.id === id);
  if (!phrase) return <span>Recording not found.</span>;

  const { effects } = phrase.recording.bufferChnl.chnl;
  const isCurrentlyPaused = isChnlMuted(effects);

  const buffer = phrase.recording.bufferChnl.buffer;
  return (
    <div className={phraseClass}>
      <button
        className={phraseAction}
        onClick={() => {
          if (isCurrentlyPaused) {
            loopio.unmute('recording', id);
          } else {
            loopio.mute('recording', id);
          }
        }}
      >
        <img src={isCurrentlyPaused ? playIcon : pauseIcon} alt="Pause" />
      </button>
      <div className={phraseWaveform}>
        {
          buffer &&
          <Waveform data={buffer} />
        }
      </div>
      <button className={phraseAction}>
        <img src={effectsIcon} alt="Apply effects" />
      </button>
    </div>
  );
};

export default withLoopIo<Props>(Recording);
