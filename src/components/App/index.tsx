import React, { useState } from 'react';
import Ciclo from '../Ciclo';
import { initializeAppState } from '../../app-state';

require('./index.css');

interface Props {}

/**
 * Renders Ciclo (Main Component) after
 * a User Interaction. Otherwise, the
 * audio context can't be instantiated.
 */
const App = (props: Props) => {
  const [isReady, setReady] = useState<boolean>(false);

  if (isReady) {
    return <Ciclo />;
  }

  return (
    <div>
      <button
        onClick={() => {
          initializeAppState();
          setReady(true);
        }}
      >
        START!
      </button>
    </div>
  );
};

export default App;
