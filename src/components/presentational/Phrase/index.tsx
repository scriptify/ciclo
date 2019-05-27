import React, { useState } from 'react';
import classnames from 'classnames';
import { DragSource, DragSourceConnector, ConnectDragSource } from 'react-dnd';
import { DragDropMonitor } from 'dnd-core';

const effectsIcon = require('../../../img/effects.png');
const trashIcon = require('../../../img/x-icon.png');
const playIcon = require('../../../img/play.png');
const pauseIcon = require('../../../img/pause.png');

let onGroupChangeCb = (id: string) => {};

const {
  phraseContainer,
  togglePlayback,
  phraseName,
  phraseActions,
  phraseAction,
  isMuted: isMutedClass,
  delete: deleteClass,
} = require('./index.css');

interface Props {
  id: string;
  onDelete: () => void;
  onEditEffects: () => void;
  onMute: () => void;
  onGroupChange: (id: string) => void;
  onNameChange: (newName: string) => void;
  name: string;
  isMuted: boolean;
  data: AudioBuffer | null;
}

interface DragProps {
  isDragging: boolean;
  connectDragSource: ConnectDragSource;
}

const dragHandler = {
  beginDrag: (props: Props) => {
    return { name: props.name };
  },
  endDrag: (props: any, monitor: DragDropMonitor) => {
    const res = monitor.getDropResult();
    if (!res || !res.id) return;
    const { id } = res;
    onGroupChangeCb(id);
  },
};

function dragStateCollect(
  connect: DragSourceConnector,
  monitor: DragDropMonitor,
) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

const Phrase = ({
  onDelete,
  onEditEffects,
  name,
  isMuted,
  onMute,
  connectDragSource,
  onGroupChange,
  onNameChange,
}: Props & DragProps) => {
  const [isEditingName, toggleEditName] = useState<boolean>(false);

  onGroupChangeCb = onGroupChange;
  return connectDragSource(
    <div className={phraseContainer}>
      <div className={phraseActions}>
        <button className={phraseAction} onClick={onEditEffects}>
          <img src={effectsIcon} alt="Edit effects" />
        </button>
        <button
          className={classnames(phraseAction, deleteClass)}
          onClick={onDelete}
        >
          <img src={trashIcon} alt="Delete phrase" />
        </button>
      </div>
      <div
        className={classnames(togglePlayback, { [isMutedClass]: isMuted })}
        onClick={onMute}
      >
        {isMuted ? (
          <img src={playIcon} alt="Start playback" />
        ) : (
          <img src={pauseIcon} alt="Pause playback" />
        )}
      </div>
      {isEditingName ? (
        <input
          type="string"
          className={phraseName}
          value={name}
          onChange={e => {
            const { value } = e.target;
            onNameChange(value);
          }}
          onBlur={() => {
            toggleEditName(false);
          }}
        />
      ) : (
        <div
          className={phraseName}
          onClick={() => {
            toggleEditName(true);
          }}
        >
          {name}
        </div>
      )}
    </div>,
  );
};

export default DragSource('phrase', dragHandler, dragStateCollect)(Phrase);
