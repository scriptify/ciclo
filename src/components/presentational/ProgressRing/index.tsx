/* tslint:disable */
import React from 'react';

interface Props {
  radius: number;
  stroke: number;
  progress: number;
  color: string;
}

export default class ProgressRing extends React.Component<Props> {
  normalizedRadius: number;
  circumference: number;

  constructor(props: Props) {
    super(props);

    const { radius, stroke } = this.props;

    this.normalizedRadius = radius - stroke * 2;
    this.circumference = this.normalizedRadius * 2 * Math.PI;
  }

  render() {
    const { radius, stroke, progress } = this.props;
    const strokeDashoffset = this.circumference - progress / 100 * this.circumference;
    return (
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ display: 'block' }}
        >
        <circle
          style={{
            strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
          stroke={this.props.color}
          fill="transparent"
          strokeWidth={ stroke }
          strokeDasharray={ `${this.circumference} ${this.circumference}` }
          r={ this.normalizedRadius }
          cx={ radius }
          cy={ radius }
          />
      </svg>
    );
  }
}
