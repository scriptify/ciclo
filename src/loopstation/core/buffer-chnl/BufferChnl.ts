import Chnl from '../chnl/Chnl';

export default class BufferChnl {
  public chnl: Chnl;
  public buffer: AudioBufferSourceNode;

  constructor(audioCtx: AudioContext, buffer: AudioBufferSourceNode) {
    this.buffer = buffer;
    this.chnl = new Chnl(audioCtx);
    this.buffer.connect(this.chnl.input);
  }

  serialize() {
    return {
      chnl: this.chnl.serialize(),
      buffer: this.buffer.buffer,
    };
  }
}
