import Tone from 'tone';
import EffectUnit from '../../effect-unit/EffectUnit';

export const convolutionalReverbData: { name: string, values:  Value[] } = {
  values: [
    {
      name: 'decay',
      options: {
        type: 'range',
        defaultValue: 1.5,
        min: 0,
        max: 3,
        step: 0.1,
      },
      set: (effectChain: EffectChain, value: number) => {
        const reverb = (effectChain.convolutionalReverb as unknown as Tone.Reverb);
        reverb.generate();
        reverb.decay = value;
      },
    },
  ],
  name: 'convolutionalReverb',
};

export default function createConvolutionalReverb(audioCtx: AudioContext) {
  (Tone as any).context = audioCtx;
  const effectChain: EffectChainParams = {
    convolutionalReverb: function createFreeverb(): AudioNode {
      const reverb = new Tone.Reverb();
      reverb.generate();
      return reverb as unknown as AudioNode;
    },
  };

  const effectUnit = new EffectUnit({
    effectChain,
    ...convolutionalReverbData,
  },                                audioCtx);

  return effectUnit;
}
