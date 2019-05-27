import React from 'react';
import { DragDropContext } from 'react-dnd';
// import HTML5Backend from 'react-dnd-html5-backend';

import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';

import BottomBar from '../stateful/BottomBar';
import Groups from '../stateful/Groups';
import EffectEditor from '../stateful/EffectEditor';
import ExternalAudioModules from '../stateful/ExternalAudioModules';
import { BottomBarContainer, ScrollContainer } from '../presentational/Layout';
import TopBar from '../stateful/TopBar';

const { app } = require('./index.css');

interface Props {}

const App = (p: Props) => {
  return (
    <div className={app}>
      <TopBar />
      <ScrollContainer>
        <Groups />
      </ScrollContainer>
      <BottomBarContainer>
        <BottomBar />
      </BottomBarContainer>
      <EffectEditor />
      <ExternalAudioModules />
    </div>
  );
};

export default DragDropContext(MultiBackend(HTML5toTouch))(App);
