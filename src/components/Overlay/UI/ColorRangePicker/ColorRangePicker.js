import React, {useState, useRef, useEffect} from 'react';
import Indicator from './Indicator/Indicator';

import './ColorRangePicker.scss';

const ColorRangePicker = () => {
  const [indicators, setIndicators] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(undefined);
  const [startX, setStartX] = useState(undefined);
  const [lastX, setLastX] = useState(undefined);
  const colorRangePicker = useRef();

  useEffect(() => {
    setIndicators([
      {position: -1, color: '#ff0000', isFixed: true},
      {position: colorRangePicker.current.offsetWidth - 1, color: '#00fff0', isFixed: true}
    ]);
  }, [colorRangePicker]);

  const addIndicator = (e) => {
    const position = (e.nativeEvent.layerX / e.target.offsetWidth) * e.target.offsetWidth - 3;
    const indicator = {position: position, color: '#ffffff'};
    const newIndicators = [...indicators, indicator];
    setIndicators(newIndicators);
  };

  const handleMouseDown = (e, indicatorId) => {
    setSelectedIndicator(indicatorId);
    setStartX(e.clientX);
    setLastX(e.clientX);
  };

  const handleMouseUp = () => {
    setStartX(undefined);
    setLastX(undefined);
  };

  const dragIndicator = (e) => {
    if (startX && !indicators[selectedIndicator].isFixed) {
      let newPosition = indicators[selectedIndicator].position + (e.clientX - lastX);
      if (newPosition < -1) newPosition = -1;
      else if (newPosition > colorRangePicker.current.offsetWidth - 1) {
        newPosition = colorRangePicker.current.offsetWidth - 1;
      }
      indicators[selectedIndicator].position = newPosition;
      setLastX(e.clientX);
    }
  };

  let gradients = '';
  const tempIndicators = [...indicators];
  tempIndicators.sort((first, second) => {
    if (first.position === second.position) return 0;
    return first.position > second.position ? 1 : -1;
  });
  tempIndicators.forEach((indicator) => {
    gradients += `, ${indicator.color} ${Math.ceil((indicator.position / colorRangePicker.current.offsetWidth) * 100)}%`;
  });

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
        style={{background: `linear-gradient(90deg${gradients})`}}
      />
      <div className="indicator-wrapper">
        {indicators.map((indicator, index) => {
          return (
            <Indicator
              key={index}
              onMouseDown={handleMouseDown}
              position={indicator.position}
              selectedColor={indicator.color}
              id={index}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorRangePicker;
