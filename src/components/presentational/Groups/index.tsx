import React, { ReactNode } from 'react';

interface Props {
  children?: ReactNode | string;
}

const {
  groupsContainer,
} = require('./index.css');

const Groups = ({ children }: Props) => (
  <div className={groupsContainer}>
    {children}
  </div>
);

export default Groups;
