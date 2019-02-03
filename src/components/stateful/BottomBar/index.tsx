import React, { useState } from 'react';
import { Observer } from 'mobx-react';

import withAppState, { WithAppState } from '../../../app-state';

import BottomBarPresentational from '../../presentational/BottomBar';

interface Props {

}

const RecordingBar = (props: WithAppState<Props>) => {
  const [currentMeasure, setCurrentMeasure]  = useState<number>(1);

  const { loopioState, loopio, uiState } = props;
  return (
    <Observer>
      {() => (
        <BottomBarPresentational
          bpm={loopioState.timing.bpm}
          measureProgress={Math.round(uiState.measureProgress * 100)}
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

export default withAppState<Props>(RecordingBar);
