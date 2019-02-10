import React from 'react';
import { observable, action } from 'mobx';
import { WithLoopIoProps, store, loopio } from '../loopstation/bindings/mobx';

class UiStore {
  private clearStateChangeCb: () => void;

  @observable measureProgress: number = 0;
  @observable phraseNames: Map<string, string> = new Map();
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
      // Add names for new phrases
      newState.recordings.forEach((phrase) => {
        if (!this.phraseNames.has(phrase.id)) {
          this.phraseNames.set(phrase.id, `Phrase ${newState.recordings.length}`);
        }
      });
    });
  }

  @action setPhraseName(id: string, newName: string) {
    this.phraseNames.set(id, newName);
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
