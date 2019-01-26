import React, { ReactNode } from 'react';
import classnames from 'classnames';

const {
  contentBar,
  topBar,
  bottomBar,
  scrollContainer,
  sidePanel,
} = require('./index.css');

interface Props {
  children: ReactNode | string;
}

export const TopBarContainer = ({ children }: Props) => (
  <div className={classnames(contentBar, topBar)}>{children}</div>
);

export const ScrollContainer = ({ children }: Props) => (
  <div className={scrollContainer}>{children}</div>
);

export const BottomBarContainer = ({ children }: Props) => (
  <div className={classnames(contentBar, bottomBar)}>{children}</div>
);

export const SidePanelContainer = ({ children }: Props) => (
  <div className={sidePanel}>{children}</div>
);
