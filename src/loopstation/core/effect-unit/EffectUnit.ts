import { functionsToValues, bindMethodsToValues, objToArray, filterValue } from './util';

interface Connectable {
  input: AudioNode;
  connect: (to: AudioNode) => void;
}

class EffectUnit implements Connectable {

  public name: string;
  public isEffectUnit: boolean = true;

  public output: GainNode;
  public input: GainNode;

  private audioCtx: AudioContext;
  private effectChain!: EffectChain;
  private values!: BoundValue[];

  private wasInitialized: boolean = false;

  private effectGain: GainNode;
  private directGain: GainNode;

  private options: EffectUnitOptions;

  private state: EffectUnitState;

  constructor(
    options: EffectUnitOptions = { name: '', effectChain: {}, values: [] },
    audioCtx: AudioContext,
  ) {
    /*
      The options object must have the following structure:
      {
        name: The name of the effect to identify it later
        effectChain: The object which contains the audioprocessors,
        values: An array which contains the available values
        for this effect and the according methods to edit them
      }
    */

    if (!audioCtx) {
      throw new Error('The AudioContext specified (3° parameter) is not defined!');
    }

    this.name = name;
    this.audioCtx = audioCtx;
    this.options = options;

    // Set to 1 ==> Effect is on; Set to 0 ==> Effect is off
    this.effectGain = this.audioCtx.createGain();
    // Set to 0 ==> Effect is on; Set to 1 ==> Effect is off
    this.directGain = this.audioCtx.createGain();

    this.output = this.audioCtx.createGain();
    this.input = this.audioCtx.createGain();

    this.input.connect(this.effectGain);
    this.input.connect(this.directGain);

    // Connect direct gain to ouput
    this.directGain.connect(this.output);

    this.state = {
      isEnabled: false,
      values: {},
    };
  }

  static connectNodes(nodeA: AudioNode | Connectable, nodeB: AudioNode | Connectable) {
    if (nodeB instanceof AudioNode) {
      nodeA.connect(nodeB);
    } else {
      nodeA.connect(nodeB.input);
    }
  }

  init() {
    if (this.wasInitialized) return;

    this.effectChain = functionsToValues(this.options.effectChain);

    // Give all 'set'-methods of the specified values the effectChain as the first parameter
    this.values = bindMethodsToValues(this.options.values, this.effectChain);

    /*
      Now execute all 'set'-methods of the according values
      which have a 'defaultValue'-field in their 'options'-object
    */
    this.values.forEach((value) => {
      if (value.options.defaultValue) {
        value.set(value.options.defaultValue);
        this.state.values[value.name] = value.options.defaultValue;
      }
    });

    this.setupEffectChain();
    this.wasInitialized = true;
  }

  enable() {
    this.init();
    this.effectGain.gain.value = 1;
    this.directGain.gain.value = 0;
    this.state.isEnabled = true;
  }

  disable() {
    this.effectGain.gain.value = 0;
    this.directGain.gain.value = 1;
    this.state.isEnabled = false;
  }

  connect(node: AudioNode | EffectUnit) {
    if (node instanceof EffectUnit) {
      this.output.connect(node.input);
    }  else {
      // Common audioNode
      this.output.connect(node);
    }
  }

  setValue(valueName: string, value: number) {
    filterValue(this.values, valueName).set(value);
    this.state.values[valueName] = value;
  }

  getValueOptions(valueName: string) {
    return filterValue(this.values, valueName).options;
  }

  setupEffectChain() {
    // Connect the effectChain
    const effects = objToArray(this.effectChain);

    // Effect chain not empty?
    if (effects.length >= 1) {
      // Connect effect gain to first effect
      EffectUnit.connectNodes(this.effectGain, effects[0]);
      // Connect all other effect to the following effect
      for (let i = 0; i < (effects.length - 1); i += 1) {
        EffectUnit.connectNodes(effects[i], effects[i + 1]);
      }

      // Connect the last effect to the output gain
      effects[effects.length - 1].connect(this.output);
    }
  }

  disconnect() {
    // Disconnect all outgoing connections
    this.output.disconnect();
  }

  /** Return a POJO representation of this object */
  serialize(): SerializedEffectUnit {
    return {
      name: this.options.name,
      state: this.state,
      values: this.options.values.map((value) => {
        const {
          set,
          ...serializableValue
        } = value;
        return serializableValue;
      }),
    };
  }

}

export default EffectUnit;
