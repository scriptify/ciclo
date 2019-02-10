import React from 'react';
import { Observer } from 'mobx-react';

import withAppState, { WithAppState } from '../../../app-state';

import { SidePanelContainer } from '../../presentational/Layout';
import EffectEditorPresentational from '../../presentational/EffectEditor';

interface Props {

}

const EffectEditor = (props: WithAppState<Props>) => {
  const { loopioState, loopio, uiState } = props;

  return (
    <Observer>
      {() => {
        if (!uiState.isEffectEditorOpen) return '';
        const effectsToEdit = uiState.effectEditorItems
          .map((item) => {
            if (item.type === 'group') {
              const group = loopioState.groups.find(g => g.id === item.id);
              if (!group) return { id: '', name: '', effects: [], type: 'group' as LoopIoNodeType };
              return {
                id: group.id,
                name: 'A group',
                type: 'group' as LoopIoNodeType,
                effects: group.group.masterChnl.effects,
              };
            }
            const phrase = loopioState.recordings.find(r => r.id === item.id);
            if (!phrase) {
              return { id: '', name: '', type: 'recording' as LoopIoNodeType, effects: [] };
            }
            return {
              id: phrase.id,
              name: uiState.phraseNames.get(phrase.id) || '',
              effects: phrase.recording.bufferChnl.chnl.effects,
              type: 'recording' as LoopIoNodeType,
            };
          })
          .filter(e => e !== null);
        return (
          <SidePanelContainer>
            <EffectEditorPresentational
              onClose={() => uiState.closeEffectEditor()}
              elements={effectsToEdit}
              onValueChange={(params) => {
                loopio.setEffectValue(params.elementType, {
                  effectName: params.effectName,
                  effectValueName: params.valueName,
                  value: params.newValue,
                  id: params.id,
                });
              }}
            />
          </SidePanelContainer>
        );
      }}
    </Observer>
  );
};

export default withAppState<Props>(EffectEditor);
