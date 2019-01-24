import Chnl from '../chnl/Chnl';

export default class Master {
  public chnl: Chnl;

  constructor(audioCtx: AudioContext) {
    this.chnl = new Chnl(audioCtx);
    this.chnl.connect(audioCtx.destination);
  }
}
