import React from 'react';
import { DragDropContext } from 'react-dnd';
// import HTML5Backend from 'react-dnd-html5-backend';

import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';

import BottomBar from '../stateful/BottomBar';
import Groups from '../stateful/Groups';
import EffectEditor from '../stateful/EffectEditor';
// import ExternalAudioModules from '../stateful/ExternalAudioModules';
import { BottomBarContainer, ScrollContainer } from '../presentational/Layout';
import TopBar from '../stateful/TopBar';

interface Props {}

const Ciclo = (p: Props) => {
  return (
    <>
      <TopBar />
      <ScrollContainer>
        <Groups />
      </ScrollContainer>
      <BottomBarContainer>
        <BottomBar />
      </BottomBarContainer>
      <EffectEditor />
      {/* <ExternalAudioModules /> */}
    </>
  );
};

export default DragDropContext(MultiBackend(HTML5toTouch))(Ciclo);
