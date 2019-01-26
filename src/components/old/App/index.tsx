import React from 'react';

import RecordingBar from '../RecordingBar';
import Groups from '../Groups';

const {
  app,
} = require('./index.css');

interface Props {

}

const App = (p: Props) => {
  return (
    <div className={app}>
      <Groups />
      <RecordingBar />
    </div>
  );
};

export default App;
