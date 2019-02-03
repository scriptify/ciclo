import React, { useState, useEffect, ReactNode } from 'react';
import withLoopIo, { WithLoopIo } from '../../../loopstation/bindings/mobx';

interface Props {
  children: (progress: number) => ReactNode;
}

let removeListener = () => {};

const MeasureProgress = ({ loopio, children }: WithLoopIo<Props>) => {
  const [progressState, setProgressState] = useState<[boolean, number]>([false, 0]);

  const [wasInitialized, progress] = progressState;

  useEffect(() => {
    const onUpdate = (p: number) => {
      setProgressState([true, Math.min(1, p)]);
    };

    if (!wasInitialized) {
      const timer = loopio.getClock();
      if (timer) {
        setProgressState([true, 0]);
        removeListener = timer.addEventListener('progress', onUpdate);
        return () => {};
      }
    }

    return () => {
      removeListener();
    };
  },        [wasInitialized]);

  return <React.Fragment>{children(progress)}</React.Fragment>;
};

export default withLoopIo<Props>(MeasureProgress);
