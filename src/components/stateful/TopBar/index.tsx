import React from 'react';
import { Observer } from 'mobx-react';

import withLoopIo, { WithLoopIo } from '../../../loopstation/bindings/mobx';

import TopBarPresentational from '../../presentational/TopBar';

interface Props {

}

const TopBar = (props: WithLoopIo<Props>) => {
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

export default withLoopIo<Props>(TopBar);
