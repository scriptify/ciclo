import Tone from 'tone';
import EffectUnit from '../../effect-unit/EffectUnit';

export const freeverbData: { name: string, values:  Value[] } = {
  values: [
    {
      name: 'dampening',
      options: {
        type: 'range',
        defaultValue: 100,
        min: 0,
        max: 8000,
        step: 1,
      },
      set: (effectChain: EffectChain, value: number) => {
        (effectChain.freeverb as unknown as Tone.Freeverb).dampening.value = value;
      },
    },
    {
      name: 'roomSize',
      options: {
        type: 'range',
        defaultValue: 0.7,
        min: 0,
        max: 1,
        step: 0.1,
      },
      set: (effectChain: EffectChain, value: number) => {
        (effectChain.freeverb as unknown as Tone.Freeverb).roomSize.value = value;
      },
    },
  ],
  name: 'freeverb',
};

export default function createFreeverb(audioCtx: AudioContext) {
  (Tone as any).context = audioCtx;
  const effectChain: EffectChainParams = {
    freeverb: function createFreeverb(): AudioNode {
      return (new Tone.Freeverb()) as unknown as AudioNode;
    },
  };

  const effectUnit = new EffectUnit({
    effectChain,
    ...freeverbData,
  },                                audioCtx);

  return effectUnit;
}
