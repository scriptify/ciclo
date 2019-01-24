import createEffects, { EffectsCollection } from '../effect-units-collection';
import EffectUnit from '../effect-unit/EffectUnit';

type ChnlGraph = (AudioNode | EffectUnit)[];

export default class Chnl {
  public input: AudioNode;
  public output: AudioNode;
  public isChnl: boolean = true;

  private effects: EffectsCollection;
  private analyser: AnalyserNode;
  protected context: AudioContext;
  private currentGraph: ChnlGraph = [];

  constructor(audioCtx: AudioContext) {
    this.context = audioCtx;
    this.input = audioCtx.createGain();
    this.output = audioCtx.createGain();
    this.analyser = audioCtx.createAnalyser();
    this.output.connect(this.analyser);
    this.effects = createEffects(audioCtx);
    // Setup initial graph
    this.setupGraph([this.input, this.effects.gain, this.output]);
  }

  setupGraph(graph: ChnlGraph) {
    // first of all, clear all connections (all nodes but the output)
    for (let i = 0; i < (this.currentGraph.length - 1); i += 1) {
      const currNode = this.currentGraph[i];
      // Disconnect all outgoing connections
      currNode.disconnect();
    }

    for (let i = 0; i < (graph.length - 1); i += 1) {
      const currNode = graph[i];
      const nextNode = graph[i + 1];
      if (nextNode instanceof EffectUnit) {
        currNode.connect(nextNode.input);
      } else {
        currNode.connect(nextNode);
      }
    }

    this.currentGraph = graph;
  }

  addEffect(name: keyof EffectsCollection) {
    const effect = this.effects[name];

    if (!effect) {
      throw new Error('You tried to add an inexistent effect.');
    }

    if (!effect.name) {
      this.effects[name as string].name = name as string;
    }

    /*
      Create new graph:
        input -> (all effects which are already present in the graph) -> effectToAdd  -> output
    */
    const newGraph = [
      this.input,
      ...this.currentGraph.filter(node => (node !== this.input && node !== this.output)),
      effect,
      this.output,
    ];

    this.setupGraph(newGraph);
  }

  removeEffect(name: keyof EffectsCollection) {
    this.setupGraph(
      this.currentGraph.filter(node =>  (node instanceof EffectUnit) && node.name !== name),
    );
  }

  connect(node: EffectUnit | AudioNode | Chnl) {
    if (node instanceof EffectUnit || node instanceof Chnl) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  }

  disconnect(target: EffectUnit | AudioNode | Chnl) {
    if (target instanceof EffectUnit || target instanceof Chnl) {
      this.output.disconnect(target.input);
    } else {
      this.output.disconnect(target);
    }
  }

  getAnalyser() {
    return this.analyser;
  }

  getEffect(name: keyof EffectsCollection) {
    return this.effects[name];
  }

  serialize(): SerializedChnl {
    return {
      effects: Object.keys(this.effects).map(key => (this.effects[key]).serialize()),
    };
  }

}
