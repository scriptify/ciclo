import React, { useState } from 'react';
import { Observer } from 'mobx-react';

import withLoopIo, { WithLoopIo } from '../../../loopstation/bindings/mobx';

import BottomBarPresentational from '../../presentational/BottomBar';

interface Props {

}

const RecordingBar = (props: WithLoopIo<Props>) => {
  const [currentMeasure, setCurrentMeasure]  = useState<number>(1);

  const { loopioState, loopio } = props;

  return (
    <Observer>
      {() => (
        <BottomBarPresentational
          currentMeasure={currentMeasure}
          hideChangeMeasure={loopioState.recordings.length > 0}
          isRecording={loopioState.isRecording}
          onCreateNewGroup={() => loopio.newGroup()}
          onMeasureChange={setCurrentMeasure}
          onRecordingToggle={() => {
            loopio.toggleRecording({ numMeasures: currentMeasure });
          }}
        />
      )}
    </Observer>
  );
};

export default withLoopIo<Props>(RecordingBar);
