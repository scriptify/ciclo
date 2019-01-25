import React from 'react';
import withLoopIo, { WithLoopIo } from '../../loopstation/bindings/react';

import Group from '../Group';

const {
  groups,
  addGroupBtn,
} = require('./index.css');

interface Props {

}

const Groups = ({ loopioState, loopio }: WithLoopIo<Props>) => {

  return (
    <div className={groups}>
      {
        loopioState.groups.map(group => (
          <Group id={group.id} key={group.id} />
        ))
      }
      <button
        className={addGroupBtn}
        onClick={() => loopio.newGroup()}
      >+</button>
    </div>
  );
};

export default withLoopIo<Props>(Groups);
