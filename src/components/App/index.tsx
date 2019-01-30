import React from 'react';
import BottomBar from '../stateful/BottomBar';
import TopBar from '../stateful/TopBar';
import Groups from '../stateful/Groups';
import { TopBarContainer, BottomBarContainer, ScrollContainer } from '../presentational/Layout';

const {
  app,
} = require('./index.css');

interface Props {

}

const App = (p: Props) => {
  return (
    <div className={app}>
      <TopBarContainer>
        <TopBar />
      </TopBarContainer>
      <ScrollContainer>
        <Groups />
      </ScrollContainer>
      <BottomBarContainer>
        <BottomBar />
      </BottomBarContainer>
    </div>
  );
};

export default App;
