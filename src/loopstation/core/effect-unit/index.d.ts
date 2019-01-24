type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface EffectChain {
  [key: string]: AudioNode;
}

interface EffectChainParams {
  [key: string]: AudioNode | (() => AudioNode);
}

interface SerializableValue {
  name: string;
  options: {
    type: 'single' | 'range';
    defaultValue: number;
    min?: number;
    max?: number;
    step?: number;
  };
}

interface Value extends SerializableValue {
  set: (effectChain: EffectChain, value: number) => void;
}

interface BoundValue extends Omit<Value, 'set'> {
  set: (value: number) => void;
}

interface EffectUnitOptions {
  name: string;
  effectChain: EffectChainParams;
  values: Value[]
}

interface EffectUnitState {
  isEnabled: boolean;
  values: {
    [key: string]: number;
  };
}

interface SerializedEffectUnit {
  state: EffectUnitState;
  name: string;
  values: SerializableValue[];
}
