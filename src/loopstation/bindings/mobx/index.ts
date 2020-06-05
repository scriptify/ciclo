import diff from 'deep-diff';
import { observable, toJS } from 'mobx';
import Loopio from '../../core/loopio/Loopio';

class Store {
  public loopio: Loopio;
  @observable public loopioState: SerializableLoopIoState;

  constructor() {
    this.loopio = new Loopio();
    this.loopioState = this.loopio.serializeState();
    this.loopio.stateChange((newState) => {
      diff.observableDiff(
        toJS(this.loopioState),
        this.loopio.serializeState(),
        (d) => {
          diff.applyChange(this.loopioState, newState, d);
        },
      );
    });
  }
}

let store: Store | null = null;

export function getStore() {
  if (store === null) {
    throw new Error('Tried to access store before it was created :(');
  }
  return store;
}

export function createStore() {
  store = new Store();
}

export interface WithLoopIoProps {
  loopio: Loopio;
  loopioState: SerializableLoopIoState;
}
