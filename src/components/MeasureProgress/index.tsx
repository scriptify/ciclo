import React, { useState, useEffect, ReactNode } from 'react';
import withLoopIo, { WithLoopIo } from '../../loopstation/bindings/mobx';

interface Props {
  children: (progress: number) => ReactNode;
}

const MeasureProgress = ({ loopio, children }: WithLoopIo<Props>) => {
  const [progressState, setProgressState] = useState<[boolean, number]>([false, 0]);

  const [wasInitialized, progress] = progressState;

  useEffect(() => {
    if (!wasInitialized) {
      const timer = loopio.getClock();
      if (timer) {
        setProgressState([true, 0]);
        timer.addEventListener('progress', (p: number) => {
          setProgressState([true, p]);
        });
      }
    }
  });

  return <React.Fragment>{children(progress)}</React.Fragment>;
};

export default withLoopIo<Props>(MeasureProgress);
