import React, { ReactNode } from 'react';

const trashIcon = require('../../img/trash.svg');
const muteIcon = require('../../img/mute.svg');
const effectsIcon = require('../../img/effects.svg');

const {
  groupContainer,
  groupHeader,
  nameRow,
  groupName,
  deleteGroupBtn,
  groupActions,
  groupAction,
  phrasesContainer,
} = require('./index.css');

interface Props {
  children?: ReactNode | string;
}

const Group = ({ children }: Props) => (
  <div className={groupContainer}>
    <header className={groupHeader}>
      <div className={nameRow}>
        <h2 className={groupName}>Beat</h2>
        <button className={deleteGroupBtn}>
          <img src={trashIcon} alt="Delete group" />
        </button>
      </div>
      <div className={groupActions}>
        <button className={groupAction}>
          <img src={muteIcon} alt="Mute group" />
        </button>
        <button className={groupAction}>
          <img src={effectsIcon} alt="Mute group" />
        </button>
      </div>
    </header>
    <div className={phrasesContainer}>
      {children}
    </div>
  </div>
);

export default Group;
