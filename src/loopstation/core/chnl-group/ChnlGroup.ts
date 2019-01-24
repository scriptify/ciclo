import Chnl from '../chnl/Chnl';

export default class ChnlGroup {
  public masterChnl: Chnl;

  constructor(audioCtx: AudioContext) {
    this.masterChnl = new Chnl(audioCtx);
  }

  /**
   * Adds a Chnl instance to the group.
   * Returns a function which disconnects the node
   * from the group again.
   */
  public add(chnl: Chnl) {
    chnl.connect(this.masterChnl.input);
    return () => {
      chnl.disconnect(this.masterChnl.input);
    };
  }

  serialize() {
    return {
      masterChnl: this.masterChnl.serialize(),
    };
  }
}
