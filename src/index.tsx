import React from 'react';
import ReactDOM from 'react-dom';
import Loopio from './loopstation/core/loopio/Loopio';

// import App from './components/App';

const loopio = new Loopio((newState) => {
  console.log('statechange', newState);
});

setTimeout(() => {
  loopio.startRecording();
  setTimeout(() => {
    loopio.stopRecording({ numMeasures: 1 });
    window.setTimeout(() => {
      loopio.mute('master');
    },                5000);
  },         2000);
},         500);

ReactDOM.render(
  (
    <div>Hello World. Nothing here sorry ma boi.</div>
  ),
  document.getElementById('app'),
);
