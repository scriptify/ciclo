import React from 'react';
import { Observer } from 'mobx-react';

const closeIcon = require('../../../img/close.png');

const {
  effectEditorContainer,
  effectEditorHeader,
  elementsContainer,
  element,
  effects,
  effect,
  effectValues,
  effectValue,
  effectsToggle,
  effectToggleElem,
  enabled,
  elementTitle,
} = require('./index.css');

interface IdParams {
  id: string;
  elementType: LoopIoNodeType;
}

interface EffectIdParams extends IdParams {
  effectName: string;
}

interface ValueChangeParams extends EffectIdParams {
  valueName: string;
  newValue: number;
}

interface Props {
  onClose: () => void;
  onValueChange: (params: ValueChangeParams) => void;
  onEffectToggle: (params: EffectIdParams) => void;
  onElementRemove: (params: IdParams) => void;
  elements: {
    id: string;
    name: string;
    type: LoopIoNodeType;
    effects: SerializedEffectUnit[];
  }[];
}

interface EffectProps {
  currEffect: SerializedEffectUnit;
  onValueChange: (newVal: number, valueName: string) => void;
}

const Effect = ({ currEffect, onValueChange }: EffectProps) => (
  <Observer>
    {() => (
      <div className={effect}>
        <h3>{currEffect.name}</h3>
        <div className={effectValues}>
          {
            currEffect.values.map(currValue => (
              <div className={effectValue} key={currValue.name}>
                <h4>{currValue.name}</h4>
                {
                  currValue.options.type === 'single' && (
                    <input
                      type="checkbox"
                      onChange={() => {
                        onValueChange(
                          currEffect.state.values[currValue.name] === 0 ? 1 : 0,
                          currValue.name,
                        );
                      }}
                      checked={!!currEffect.state.values[currValue.name]}
                    />
                  )
                }
                {
                  currValue.options.type === 'range' && (
                    <input
                      type="range"
                      value={currEffect.state.values[currValue.name]}
                      step={currValue.options.step}
                      min={currValue.options.min}
                      max={currValue.options.max}
                      onChange={(e) => {
                        onValueChange(parseFloat(e.target.value), currValue.name);
                      }}
                    />
                  )
                }
              </div>
            ))
          }
        </div>
      </div>
    )}
  </Observer>
);

const EffectEditor = ({
  onClose,
  elements,
  onValueChange,
  onEffectToggle,
  onElementRemove,
}: Props) => {
  return (
    <Observer>
      {() => (
        <div className={effectEditorContainer}>
          <header className={effectEditorHeader}>
            <button onClick={onClose}>
              <img src={closeIcon} alt="Close effect editor" />
            </button>
          </header>
          <div className={elementsContainer}>
            {
              elements.map(currElem => (
                <div className={element} key={currElem.id}>
                  <div className={elementTitle}>
                    <h2>{currElem.name}</h2>
                    <button onClick={() => {
                      onElementRemove({
                        elementType: currElem.type,
                        id: currElem.id,
                      });
                    }}>
                      <img src={closeIcon} alt="Remove element from editor" />
                    </button>
                  </div>
                  <div className={effectsToggle}>
                    {
                      currElem.effects.map(effect => (
                        <button
                          className={
                            effect.state.isEnabled ?
                            `${effectToggleElem} ${enabled}` : effectToggleElem
                          }
                          key={effect.name}
                          onClick={() => {
                            onEffectToggle({
                              effectName: effect.name,
                              elementType: currElem.type,
                              id: currElem.id,
                            });
                          }}
                        >
                          {effect.name}
                        </button>
                      ))
                    }
                  </div>
                  <div className={effects}>
                    {
                      currElem.effects
                        .filter(currEffect => currEffect.state.isEnabled)
                        .map(currEffect => (
                          <Effect
                            currEffect={currEffect}
                            key={currEffect.name}
                            onValueChange={(newValue, valueName) => {
                              onValueChange({
                                valueName,
                                newValue,
                                effectName: currEffect.name,
                                id: currElem.id,
                                elementType: currElem.type,
                              });
                            }}
                          />
                        ))
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </Observer>
  );
};

export default EffectEditor;
