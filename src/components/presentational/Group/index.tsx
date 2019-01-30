import React, { ReactNode } from 'react';
import classnames from 'classnames';

const trashIcon = require('../../../img/trash.svg');
const muteIcon = require('../../../img/mute.svg');
const unmuteIcon = require('../../../img/volume.svg');
const effectsIcon = require('../../../img/effects.svg');

const {
  groupContainer,
  groupHeader,
  nameRow,
  groupName,
  deleteGroupBtn,
  groupActions,
  groupAction,
  phrasesContainer,
  isSelected: isSelectedClass,
} = require('./index.css');

interface Props {
  children?: ReactNode | string;
  onDelete: () => void;
  onEditEffects: () => void;
  onMute: () => void;
  onSelect: () => void;
  name: string;
  isMuted: boolean;
  isSelected: boolean;
}

const Group = ({
  children,
  onDelete,
  onEditEffects,
  onMute,
  onSelect,
  name,
  isMuted,
  isSelected,
}: Props) => (
  <div className={groupContainer} onClick={onSelect}>
    <header className={classnames(groupHeader, { [isSelectedClass]: isSelected })}>
      <div className={nameRow}>
        <h2 className={groupName}>{name}</h2>
        <button
          className={deleteGroupBtn}
          onClick={(e) => {
            // Do not fire onSelect event
            e.stopPropagation();
            onDelete();
          }}
        >
          <img src={trashIcon} alt="Delete group" />
        </button>
      </div>
      <div className={groupActions}>
        <button className={groupAction} onClick={onMute}>
          {
            isMuted ? (
              <img src={unmuteIcon} alt="Unmute group" />
            ) : (
              <img src={muteIcon} alt="Mute group" />
            )
          }
        </button>
        <button className={groupAction} onClick={onEditEffects}>
          <img src={effectsIcon} alt="Edit group effects" />
        </button>
      </div>
    </header>
    <div className={phrasesContainer}>
      {children}
    </div>
  </div>
);

export default Group;
