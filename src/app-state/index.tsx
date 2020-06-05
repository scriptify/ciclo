import React from 'react';
import { observable, action } from 'mobx';
import {
  WithLoopIoProps,
  getStore,
  createStore,
} from '../loopstation/bindings/mobx';

class UiStore {
  private clearStateChangeCb: () => void;

  @observable measureProgress: number = 0;
  @observable namings: Map<string, string> = new Map();
  @observable isEffectEditorOpen: boolean = false;
  @observable isExternalAudioModulesListOpen: boolean = false;
  @observable effectEditorItems: { id: string; type: LoopIoNodeType }[] = [];

  constructor() {
    this.clearStateChangeCb = getStore().loopio.stateChange(() => {
      const clock = getStore().loopio.getClock();
      if (clock) {
        this.clearStateChangeCb();
        clock.addEventListener('progress', (p: number) => {
          this.measureProgress = p;
        });
      }
    });

    getStore().loopio.stateChange((newState) => {
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
    if (!!!this.effectEditorItems.find((item) => item.id === id)) {
      this.effectEditorItems.push({ id, type });
    }
  }

  @action removeFromEffectEditor(id: string) {
    this.effectEditorItems = this.effectEditorItems.filter(
      (item) => item.id !== id,
    );
  }

  @action closeEffectEditor() {
    this.isEffectEditorOpen = false;
  }

  @action openExternalAudioModulesList() {
    this.isExternalAudioModulesListOpen = true;
  }

  @action closeExternalAudioModulesList() {
    this.isExternalAudioModulesListOpen = false;
  }
}

let uiStore: UiStore | null = null;

function getUiStore() {
  if (uiStore === null) {
    throw new Error(
      'App state must first be initalized before the Main Component (Ciclo) can be rendered. Call "initializeAppState" first.',
    );
  }
  return uiStore;
}

export function initializeAppState() {
  createStore();
  uiStore = new UiStore();
}

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
        loopio: getStore().loopio,
        loopioState: getStore().loopioState,
        uiState: getUiStore(),
      };
      return <WrappedComponent {...props} />;
    }
  }

  return WithLoopIoClass;
}
