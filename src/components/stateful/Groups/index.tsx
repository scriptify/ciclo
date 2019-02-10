import React from 'react';
import { Observer } from 'mobx-react';

import withAppState, { WithAppState } from '../../../app-state';
import { isChnlMuted } from '../../../util';

import GroupsPresentational from '../../presentational/Groups';
import GroupPresentational from '../../presentational/Group';
import PhrasePresentational from '../../presentational/Phrase';

interface Props {

}

const Groups = (props: WithAppState<Props>) => {
  const { loopioState, loopio, uiState } = props;

  return (
    <Observer>
      {() => (
        <GroupsPresentational>
          {
            loopioState.groups.map((group, i)  => {
              const groupName = uiState.namings.get(group.id);
              const isCurrentlyPaused = isChnlMuted(group.group.masterChnl.effects);
              const phrasesOfGroup = loopioState.recordings
                .filter(r => r.recording.groupId === group.id);

              return (
                <GroupPresentational
                  key={group.id}
                  id={group.id}
                  isSelected={group.id === loopioState.activeGroup}
                  name={groupName || ''}
                  onDelete={() => loopio.deleteGroup(group.id)}
                  isMuted={isCurrentlyPaused}
                  onEditEffects={() => {
                    uiState.addToEffectEditor(group.id, 'group');
                  }}
                  onMute={() => {
                    if (isCurrentlyPaused) {
                      loopio.unmute('group', group.id);
                    } else {
                      loopio.mute('group', group.id);
                    }
                  }}
                  onSelect={() => loopio.selectGroup(group.id)}
                  onNameChange={(name: string) => {
                    uiState.setNaming(group.id, name);
                  }}
                >
                  {
                    phrasesOfGroup.reverse().map((phrase, i) => {
                      const isMuted = isChnlMuted(phrase.recording.bufferChnl.chnl.effects);
                      const phraseName = uiState.namings.get(phrase.id);

                      return (
                        <PhrasePresentational
                          key={phrase.id}
                          id={phrase.id}
                          name={phraseName || ''}
                          onDelete={() => loopio.deleteRecording(phrase.id)}
                          onGroupChange={(newGroupId) => {
                            loopio.moveRecordingToGroup(newGroupId, phrase.id);
                          }}
                          onNameChange={(name: string) => {
                            uiState.setNaming(phrase.id, name);
                          }}
                          data={phrase.recording.bufferChnl.buffer}
                          onEditEffects={() => {
                            uiState.addToEffectEditor(phrase.id, 'recording');
                          }}
                          onMute={() => {
                            if (isMuted) {
                              loopio.unmute('recording', phrase.id);
                            } else {
                              loopio.mute('recording', phrase.id);
                            }
                          }}
                          isMuted={isMuted}
                        />
                      );
                    })
                  }
                </GroupPresentational>
              );
            })
          }
        </GroupsPresentational>
      )}
    </Observer>
  );
};

export default withAppState<Props>(Groups);
