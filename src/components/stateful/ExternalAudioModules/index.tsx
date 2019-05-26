import React from 'react';
import { Observer } from 'mobx-react';

import withAppState, { WithAppState } from '../../../app-state';

import ExternalAudioModulesPresentational from '../../presentational/ExternalAudioModules';

interface Props {}

const ExternalAudioModules = (props: WithAppState<Props>) => {
  const { loopioState, loopio, uiState } = props;

  return (
    <Observer>
      {() => {
        if (!uiState.isExternalAudioModulesListOpen) return '';
        return (
          <ExternalAudioModulesPresentational
            modules={loopioState.externalAudioModules}
            onChoose={externalAudioModule => {
              loopio.createExternalAudioModules(externalAudioModule);
              uiState.closeExternalAudioModulesList();
            }}
            onClose={() => {
              uiState.closeExternalAudioModulesList();
            }}
          />
        );
      }}
    </Observer>
  );
};

export default withAppState<Props>(ExternalAudioModules);
