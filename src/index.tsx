import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

/* import withLoopio, { WithLoopIo } from './loopstation/bindings/react';

interface TestProps {
  cool: number;
}

const Test = (props: WithLoopIo<TestProps>) => {
  return <div>Hello World. Nothing here sorry ma boi.</div>;
};

const TestWithLoopio = withLoopio<TestProps>(Test); */

ReactDOM.render(<App />, document.getElementById('app'));
