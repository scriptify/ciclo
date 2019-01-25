import React from 'react';
import Loopio from '../../core/loopio/Loopio';

interface WithLoopIoProps {
  loopio: Loopio;
  loopioState: SerializableLoopIoState;
}

export type WithLoopIo<P> = P & WithLoopIoProps;

const loopio = new Loopio();

export default function withLoopIo<TProps>(
  WrappedComponent: React.ComponentType<WithLoopIo<TProps>>,
): React.ComponentClass<TProps> {

  class WithLoopIo extends React.Component<TProps, WithLoopIoProps> {
    constructor(props: TProps) {
      super(props);
      loopio.stateChange(this.onLoopIoStateChange.bind(this));
      this.state = {
        loopio,
        loopioState: loopio.serializeState(),
      };
    }

    onLoopIoStateChange(newState: SerializableLoopIoState) {
      this.setState({
        ...this.state,
        loopioState: newState,
      });
    }

    render() {
      const props = {
        ...this.props,
        ...this.state,
      };
      return (
        <WrappedComponent {...props} />
      );
    }
  }

  return WithLoopIo;
}
