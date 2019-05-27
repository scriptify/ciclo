import React from 'react';
const {
  externalAudioModules,
  externalAudioModule,
  closeBtn,
  externalAudioModulesList,
} = require('./index.css');

const closeIcon = require('../../../img/x-icon.png');

interface Props {
  onChoose: (e: ExternalAudioModule) => void;
  onClose: () => void;
  modules: ExternalAudioModule[];
}

const ExternalAudioModules = ({ onChoose, modules, onClose }: Props) => {
  return (
    <div className={externalAudioModules}>
      <button className={closeBtn} onClick={onClose}>
        <img src={closeIcon} alt="Close Effects Audio Modules chooser" />
      </button>
      <div className={externalAudioModulesList}>
        {modules.map(m => (
          <button
            key={m.id}
            onClick={() => onChoose(m)}
            className={externalAudioModule}
          >
            <img src={m.thumbnail} />
            <p>{m.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExternalAudioModules;
