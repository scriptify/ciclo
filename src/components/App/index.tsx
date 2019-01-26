import React from 'react';
import TopBar from '../TopBar';
import BottomBar from '../BottomBar';
import Group from '../Group';
import Groups from '../Groups';
import Phrase from '../Phrase';
import { TopBarContainer, BottomBarContainer, ScrollContainer } from '../Layout';

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
        <Groups>
          <Group>
            <Phrase />
            <Phrase />
            <Phrase />
            <Phrase />
            <Phrase />
            <Phrase />
            <Phrase />
            <Phrase />
            <Phrase />
            <Phrase />
          </Group>
          <Group />
          <Group />
          <Group />
          <Group />
          <Group />
          <Group />
          <Group />
        </Groups>
      </ScrollContainer>
      <BottomBarContainer>
        <BottomBar />
      </BottomBarContainer>
    </div>
  );
};

export default App;
