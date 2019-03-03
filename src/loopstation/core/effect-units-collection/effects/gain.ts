import EffectUnit from '../../effect-unit/EffectUnit';

const values: Value[] = [
  {
    name: 'gain',
    options: {
      type: 'range',
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.01,
    },
    set: (effectChain: EffectChain, value: number) => {
      (effectChain.gain as GainNode).gain.value = value;
    },
  },
  {
    name: 'muted',
    options: {
      type: 'single',
      defaultValue: 0,
    },
    set: (effectChain: EffectChain, value: number) => {
      (effectChain.gain as GainNode).gain.value = value ? 0 : 1;
    },
  },
];

export const gainData = {
  values,
  name: 'gain',
};

export default function createGain(audioCtx: AudioContext) {

  const effectChain: EffectChainParams = {
    gain: function createGainNode(): AudioNode {
      return audioCtx.createGain();
    },
  };

  const options: EffectUnitOptions = {
    ...gainData,
    effectChain,
  };

  const gainNode = new EffectUnit(options, audioCtx);

  // Enabled by default
  gainNode.enable();

  return gainNode;
}
