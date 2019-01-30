import React from 'react';
import { Observer } from 'mobx-react';

import withLoopIo, { WithLoopIo } from '../../../loopstation/bindings/mobx';
import { isChnlMuted } from '../../../util';

import GroupsPresentational from '../../presentational/Groups';
import GroupPresentational from '../../presentational/Group';
import PhrasePresentational from '../../presentational/Phrase';

interface Props {

}

const Groups = (props: WithLoopIo<Props>) => {
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
                    phrasesOfGroup.map((phrase, i) => {
                      const isMuted = isChnlMuted(phrase.recording.bufferChnl.chnl.effects);

                      return (
                        <PhrasePresentational
                          key={phrase.id}
                          name={`Phrase ${i + 1}`}
                          onDelete={() => loopio.deleteRecording(phrase.id)}
                          onEditEffects={() => {}}
                          onMute={() => {
                            if (isCurrentlyPaused) {
                              loopio.unmute('recording', phrase.id);
                            } else {
                              loopio.mute('recording', phrase.id);
                            }
                          }}
                          isMuted={isMuted}
                          progress={60}
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

export default withLoopIo<Props>(Groups);
