export const isChnlMuted = (effects: SerializedEffectUnit[]) => (
  !!effects.find(effect => effect.name === 'gain' && effect.state.values.muted === 1)
);
