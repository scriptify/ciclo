import React from 'react';
import diff from 'deep-diff';
import { observable, toJS } from 'mobx';
import Loopio from '../../core/loopio/Loopio';

const loopio = new Loopio();

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

const store = new Store();

interface WithLoopIoProps {
  loopio: Loopio;
  loopioState: SerializableLoopIoState;
}

export type WithLoopIo<P> = P & WithLoopIoProps;

export default function withLoopIo<TProps>(
  WrappedComponent: React.ComponentType<WithLoopIo<TProps>>,
): React.ComponentClass<TProps> {

  class WithLoopIoClass extends React.Component<TProps> {

    render() {
      const props = {
        ...this.props,
        loopio,
        loopioState: store.loopioState,
      };
      return <WrappedComponent {...props} />;
    }
  }

  return WithLoopIoClass;
}
