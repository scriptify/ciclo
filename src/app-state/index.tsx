import React from 'react';
import { observable, action } from 'mobx';
import { WithLoopIoProps, store, loopio } from '../loopstation/bindings/mobx';

class UiStore {
  private clearStateChangeCb: () => void;

  @observable measureProgress: number = 0;
  @observable namings: Map<string, string> = new Map();
  @observable isEffectEditorOpen: boolean  = false;
  @observable effectEditorItems: ({ id: string, type: LoopIoNodeType })[] = [];

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

    loopio.stateChange((newState) => {
      // Add names for new phrases / groups
      newState.recordings.forEach((phrase) => {
        if (!this.namings.has(phrase.id)) {
          this.namings.set(phrase.id, `Phrase ${newState.recordings.length}`);
        }
      });

      newState.groups.forEach((group) => {
        if (!this.namings.has(group.id)) {
          this.namings.set(group.id, `Group ${newState.groups.length}`);
        }
      });
    });
  }

  @action setNaming(id: string, newName: string) {
    this.namings.set(id, newName);
  }

  @action addToEffectEditor(id: string, type: LoopIoNodeType) {
    this.isEffectEditorOpen = true;
    if (!!!this.effectEditorItems.find(item => item.id === id)) {
      this.effectEditorItems.push({ id, type });
    }
  }

  @action removeFromEffectEditor(id: string) {
    this.effectEditorItems = this.effectEditorItems.filter(item => item.id !== id);
  }

  @action closeEffectEditor() {
    this.isEffectEditorOpen = false;
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
