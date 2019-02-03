import React from 'react';
import { observable } from 'mobx';
import { WithLoopIoProps, store, loopio } from '../loopstation/bindings/mobx';

class UiStore {
  private clearStateChangeCb: () => void;

  @observable measureProgress: number = 0;

  constructor() {
    this.clearStateChangeCb = loopio.stateChange(() => {
      const clock = loopio.getClock();
      if (clock) {
        this.clearStateChangeCb();
        clock.addEventListener('progress', (p: number) => {
          this.measureProgress = p;
        });
      }
    });
  }
}

const uiStore = new UiStore();

interface WithAppStateProps extends WithLoopIoProps {
  uiState: UiStore;
}

export type WithAppState<P> = P & WithAppStateProps;

export default function withAppState<TProps>(
  WrappedComponent: React.ComponentType<WithAppState<TProps>>,
): React.ComponentClass<TProps> {

  class WithLoopIoClass extends React.Component<TProps> {

    render() {
      const props = {
        ...this.props,
        loopio,
        loopioState: store.loopioState,
        uiState: uiStore,
      };
      return <WrappedComponent {...props} />;
    }
  }

  return WithLoopIoClass;
}
