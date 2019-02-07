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
  const { loopioState, loopio } = props;

  return (
    <Observer>
      {() => (
        <GroupsPresentational>
          {
            loopioState.groups.map((group, i)  => {
              const isCurrentlyPaused = isChnlMuted(group.group.masterChnl.effects);
              const phrasesOfGroup = loopioState.recordings
                .filter(r => r.recording.groupId === group.id);

              return (
                <GroupPresentational
                  key={group.id}
                  id={group.id}
                  isSelected={group.id === loopioState.activeGroup}
                  name={`Group ${i + 1}`}
                  onDelete={() => loopio.deleteGroup(group.id)}
                  isMuted={isCurrentlyPaused}
                  onEditEffects={() => {}}
                  onMute={() => {
                    if (isCurrentlyPaused) {
                      loopio.unmute('group', group.id);
                    } else {
                      loopio.mute('group', group.id);
                    }
                  }}
                  onSelect={() => loopio.selectGroup(group.id)}
                >
                  {
                    phrasesOfGroup.reverse().map((phrase, i) => {
                      const isMuted = isChnlMuted(phrase.recording.bufferChnl.chnl.effects);

                      return (
                        <PhrasePresentational
                          key={phrase.id}
                          id={phrase.id}
                          name={`Phrase ${phrasesOfGroup.length - i}`}
                          onDelete={() => loopio.deleteRecording(phrase.id)}
                          onGroupChange={(newGroupId) => {
                            loopio.moveRecordingToGroup(newGroupId, phrase.id);
                          }}
                          onEditEffects={() => {}}
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
