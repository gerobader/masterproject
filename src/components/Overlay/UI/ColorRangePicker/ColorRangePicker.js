/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
import React, {useState, useRef, useEffect} from 'react';
import Indicator from './Indicator/Indicator';

import './ColorRangePicker.scss';

const ColorRangePicker = ({indicators, setIndicators}) => {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState(undefined);
  const [startX, setStartX] = useState(undefined);
  const [lastX, setLastX] = useState(undefined);
  const colorRangePicker = useRef();

  useEffect(() => {
    if (colorRangePicker.current) {
      setIndicators([
        {
          position: -1, positionPercent: 0, color: '#ff0000', isFixed: true
        },
        {
          position: colorRangePicker.current.offsetWidth - 1, positionPercent: 100, color: '#00fff0', isFixed: true
        }
      ]);
    }
  }, [colorRangePicker]);

  const addIndicator = (e) => {
    const positionPercent = Math.ceil((e.nativeEvent.layerX / e.target.offsetWidth) * 100);
    const position = (e.nativeEvent.layerX / e.target.offsetWidth) * e.target.offsetWidth - 3;
    const indicator = {
      positionPercent, position, color: '#ffffff', isDragged: false
    };
    const newIndicators = [...indicators, indicator];
    setIndicators(newIndicators);
  };

  const deleteIndicator = () => {
    if (selectedIndicatorId && selectedIndicatorId > 1) {
      const newIndicators = indicators.filter((indicator, index) => index !== selectedIndicatorId);
      setSelectedIndicatorId(undefined);
      setIndicators(newIndicators);
    }
  };

  useEffect(() => {
    const callDeleteIndicator = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteIndicator();
    };
    document.addEventListener('keydown', callDeleteIndicator);
    return () => {
      document.removeEventListener('keydown', callDeleteIndicator);
    };
  }, [deleteIndicator]);

  const setIndicatorColor = (color, id) => {
    const newIndicators = [...indicators];
    newIndicators[id].color = color;
    setIndicators(newIndicators);
  };

  const handleMouseDown = (e, indicatorId) => {
    setSelectedIndicatorId(indicatorId);
    setStartX(e.clientX);
    setLastX(e.clientX);
  };

  const handleMouseUp = () => {
    if (selectedIndicatorId) {
      setStartX(undefined);
      setLastX(undefined);
      setTimeout(() => {
        indicators[selectedIndicatorId].isDragged = false;
      }, 30);
    }
  };

  const dragIndicator = (e) => {
    if (startX && !indicators[selectedIndicatorId].isFixed) {
      indicators[selectedIndicatorId].isDragged = true;
      let newPosition = indicators[selectedIndicatorId].position + (e.clientX - lastX);
      if (newPosition < 5) newPosition = 5;
      else if (newPosition > colorRangePicker.current.offsetWidth - 6) {
        newPosition = colorRangePicker.current.offsetWidth - 6;
      }
      indicators[selectedIndicatorId].position = newPosition;
      indicators[selectedIndicatorId].positionPercent = Math.ceil((newPosition / colorRangePicker.current.offsetWidth) * 100);
      setLastX(e.clientX);
    }
  };

  let gradients = '';
  if (colorRangePicker.current) {
    const tempIndicators = [...indicators];
    tempIndicators.sort((first, second) => {
      if (first.position === second.position) return 0;
      return first.position > second.position ? 1 : -1;
    });
    tempIndicators.forEach((indicator) => {
      gradients += `, ${indicator.color} ${indicator.positionPercent}%`;
    });
  }

  return (
    <div
      className="color-range-picker"
      onMouseLeave={handleMouseUp}
      onMouseMove={dragIndicator}
      onMouseUp={handleMouseUp}
      ref={colorRangePicker}
    >
      <div
        className="color-range"
        onClick={(e) => addIndicator(e)}
        style={gradients ? {background: `linear-gradient(90deg${gradients})`} : {}}
      />
      <div className="indicator-wrapper">
        {indicators.map((indicator, index) => (
          <Indicator
            key={index}
            onMouseDown={handleMouseDown}
            position={indicator.position}
            color={indicator.color}
            setColor={setIndicatorColor}
            id={index}
            shouldOpenPicker={!indicator.isDragged}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorRangePicker;
