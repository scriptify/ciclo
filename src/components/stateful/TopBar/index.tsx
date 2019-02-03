import React from 'react';
import { Observer } from 'mobx-react';

import withAppState, { WithAppState } from '../../../app-state';

import TopBarPresentational from '../../presentational/TopBar';

interface Props {

}

const TopBar = (props: WithAppState<Props>) => {
  const { loopioState } = props;

  return (
    <Observer>
      {() => (
        <TopBarPresentational
          bpm={loopioState.timing.bpm}
        />
      )}
    </Observer>
  );
};

export default withAppState<Props>(TopBar);
