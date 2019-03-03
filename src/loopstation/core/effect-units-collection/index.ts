/* import Tuna from 'tunajs';
import createChorus, { chorusData } from './effects/chorus';
import createDelay, { delayData } from './effects/delay';
import createPhaser, { phaserData } from './effects/phaser';
import createCompressor, { compressorData } from './effects/compressor';
import createTremolo, { tremoloData } from './effects/tremolo';
import createWahWah, { wahWahData } from './effects/wahwah';
import createBitcrusher, { bitcrusherData } from './effects/bitcrusher';
import createMoog, { moogData } from './effects/moog';
import createPingPongDelay, { pingPongDelayData } from './effects/pingPongDelay';

import createLowpass, { lowpassData } from './effects/lowpass';
import createHighpass, { highpassData } from './effects/highpass';
import createDubDelay, { dubDelayData } from './effects/dubDelay';
import createReverb, { reverbData } from './effects/reverb'; */

import createGain, { gainData } from './effects/gain';
import createReverb, { reverbData } from './effects/reverb';
import EffectUnit from '../effect-unit/EffectUnit';

export const EFFECT_DATA = [
  gainData,
  reverbData,
  /* highpassData,
  lowpassData,
  dubDelayData,
  reverbData,
  chorusData,
  delayData,
  phaserData,
  compressorData,
  tremoloData,
  wahWahData,
  bitcrusherData,
  moogData,
  pingPongDelayData */
];

export interface EffectsCollection {
  gain: EffectUnit;
  [key: string]: EffectUnit;
}

export default function createEffectCollection(audioCtx: AudioContext): EffectsCollection {
  // const tuna = new Tuna(audioCtx);

  return {
    gain: createGain(audioCtx),
    reverb: createReverb(audioCtx),
    /* lowpass: createLowpass(audioCtx),
    highpass: createHighpass(audioCtx),
    dubDelay: createDubDelay(audioCtx),
    reverb: createReverb(audioCtx),
    chorus: createChorus(audioCtx, tuna),
    delay: createDelay(audioCtx, tuna),
    phaser: createPhaser(audioCtx, tuna),
    compressor: createCompressor(audioCtx, tuna),
    tremolo: createTremolo(audioCtx, tuna),
    wahwah: createWahWah(audioCtx, tuna),
    bitcrusher: createBitcrusher(audioCtx, tuna),
    moog: createMoog(audioCtx, tuna),
    pingPongDelay: createPingPongDelay(audioCtx, tuna) */
  };
}
