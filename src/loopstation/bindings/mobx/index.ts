import diff from 'deep-diff';
import { observable, toJS } from 'mobx';
import Loopio from '../../core/loopio/Loopio';

export const loopio = new Loopio();

class Store {
  public loopio = loopio;
  @observable public loopioState: SerializableLoopIoState;

  constructor() {
    this.loopioState = loopio.serializeState();
    loopio.stateChange((newState) => {
      diff.observableDiff(toJS(this.loopioState), loopio.serializeState(), (d) => {
        diff.applyChange(this.loopioState, newState, d);
      });
    });
  }
}

export const store = new Store();

export interface WithLoopIoProps {
  loopio: Loopio;
  loopioState: SerializableLoopIoState;
}
