import React, { ReactNode, useState } from 'react';
import classnames from 'classnames';
import { DropTarget, DropTargetConnector, DropTargetMonitor, ConnectDropTarget } from 'react-dnd';

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
  id: string;
  onDelete: () => void;
  onEditEffects: () => void;
  onMute: () => void;
  onSelect: () => void;
  onNameChange: (newName: string) => void;
  name: string;
  isMuted: boolean;
  isSelected: boolean;
}

interface DropTargetProps {
  connectDropTarget: ConnectDropTarget;
  canDrop: boolean;
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
  connectDropTarget,
  onNameChange,
}: Props & DropTargetProps) => {
  const [isEditingName, toggleEditName] = useState<boolean>(false);

  return connectDropTarget(
    <div className={groupContainer} onClick={onSelect}>
      <header className={classnames(groupHeader, { [isSelectedClass]: isSelected })}>
        <div className={nameRow}>
          {
            isEditingName ? (
              <input
                type="string"
                className={groupName}
                value={name}
                onChange={(e) => {
                  const { value } = e.target;
                  onNameChange(value);
                }}
                onBlur={() => {
                  toggleEditName(false);
                }}
              />
            ) : (
              <h2
                className={groupName}
                onClick={() => {
                  toggleEditName(true);
                }}
              >{name}</h2>
            )
          }
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
    </div>,
  );
};

function collect(connect: DropTargetConnector, monitor: DropTargetMonitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    candDrop: monitor.canDrop(),
  };
}

const target = {
  drop(props: Props) {
    return { id: props.id };
  },
};

export default DropTarget('phrase', target, collect)(Group);
