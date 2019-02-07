import React from 'react';
import classnames from 'classnames';
import { DragSource, DragSourceConnector, ConnectDragSource } from 'react-dnd';
import { DragDropMonitor } from 'dnd-core';

const effectsIcon = require('../../../img/effects.svg');
const trashIcon = require('../../../img/trash.svg');
const playIcon = require('../../../img/play.svg');
const pauseIcon = require('../../../img/pause.svg');

let onGroupChangeCb = (id: string) => {};

const {
  phraseContainer,
  togglePlayback,
  phraseName,
  phraseActions,
  phraseAction,
  isMuted: isMutedClass,
} = require('./index.css');

interface Props {
  id: string;
  onDelete: () => void;
  onEditEffects: () => void;
  onMute: () => void;
  onGroupChange: (id: string) => void;
  name: string;
  isMuted: boolean;
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
    const { id } =  res;
    onGroupChangeCb(id);
  },
};

function dragStateCollect(connect: DragSourceConnector, monitor: DragDropMonitor) {
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
  isDragging,
  connectDragSource,
  onGroupChange,
}: Props & DragProps) => {
  onGroupChangeCb = onGroupChange;
  return connectDragSource(
    <div className={phraseContainer}>
      <div className={phraseActions}>
        <button className={phraseAction} onClick={onDelete}>
          <img src={trashIcon} alt="Delete phrase" />
        </button>
        <button className={phraseAction} onClick={onEditEffects}>
          <img src={effectsIcon} alt="Edit effects" />
        </button>
      </div>
      <div
        className={classnames(togglePlayback, { [isMutedClass]: isMuted })}
        onClick={onMute}
      >
        {
          isMuted ? (
            <img src={playIcon} alt="Start playback" />
          ) : (
            <img src={pauseIcon} alt="Pause playback" />
          )
        }
      </div>
      <div className={phraseName}>{name}</div>
    </div>,
  );
};

export default DragSource('phrase', dragHandler, dragStateCollect)(Phrase);
