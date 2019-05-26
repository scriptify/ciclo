import React, { useState, useEffect } from 'react';
import { Observer } from 'mobx-react';

import withAppState, { WithAppState } from '../../../app-state';

import BottomBarPresentational from '../../presentational/BottomBar';

interface Props {}

const RecordingBar = (props: WithAppState<Props>) => {
  const [currentMeasure, setCurrentMeasure] = useState<number>(1);
  const [wasSetup, setup] = useState<boolean>(false);

  const { loopioState, loopio, uiState } = props;

  useEffect(() => {
    if (!wasSetup) {
      setup(true);
      window.addEventListener('keydown', e => {
        if (e.keyCode === 32) {
          loopio.toggleRecording({ numMeasures: currentMeasure });
        }
      });
    }
  });

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
          onOpenAudioModulesList={() => {
            uiState.openExternalAudioModulesList();
          }}
        />
      )}
    </Observer>
  );
};

export default withAppState<Props>(RecordingBar);
