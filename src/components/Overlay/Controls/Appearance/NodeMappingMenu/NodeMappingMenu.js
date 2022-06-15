import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import ExpandableSetting from '../../../UI/ExpandableSetting/ExpandableSetting';
import {sortArray} from '../../../../utility';
import Setting from '../../../UI/Setting/Setting';
import ColorRangePicker from '../../../UI/ColorRangePicker/ColorRangePicker';
import RangeInput from '../../../UI/RangeInput/RangeInput';
import Select from '../../../UI/Select/Select';
import SmallNumberInput from '../../../UI/SmallNumberInput/SmallNumberInput';
import ColorPicker from '../../../UI/ColorPicker/ColorPicker';
import {shapes} from '../../../../constants';

const NodeMappingMenu = ({
  elementColorMappingValue, setElementColorMappingValue, setElementColorMapIndicators, elementColorMapIndicators,
  elementColorMappingType, setElementColorMappingType,
  elementSizeMappingValue, setElementSizeMappingValue, setElementSizeMapping, elementSizeMappingType, setElementSizeMappingType,
  elementSizeMapping,
  nodeShapeMappingValue, setNodeShapeMappingValue, nodeShapeMapping, setNodeShapeMapping,
  labelColorMappingValue, setLabelColorMappingValue, labelColorMapIndicators, setLabelColorMapIndicators,
  labelSizeMappingValue, setLabelSizeMappingValue, labelSizeMapping, setLabelSizeMapping
}) => {
  const {nodes} = useSelector((state) => state.network);
  const {performanceMode} = useSelector((state) => state.settings);
  const nodeDataPoints = useMemo(() => {
    const data = {};
    nodes.forEach((node) => {
      Object.keys(node.data).forEach((dataPoint) => {
        if (dataPoint in data) {
          if (!data[dataPoint].includes(node.data[dataPoint])) {
            data[dataPoint].push(node.data[dataPoint]);
          }
        } else {
          data[dataPoint] = [node.data[dataPoint]];
        }
      });
    });
    const mappingValues = Object.keys(data);
    mappingValues.forEach((mappingValue) => {
      if (typeof data[mappingValue][0] === 'number') {
        data[mappingValue].sort((a, b) => sortArray(a, b));
      }
    });
    return data;
  }, [nodes]);

  const createMappingInputs = (mappingProperty, mappingValue, mappingType, rangeMapping, rangeMappingSetter) => {
    if (!mappingValue) return null;
    if (mappingType === 'relative' && mappingProperty !== 'shape') {
      return (
        <Setting name="Range">
          {mappingProperty === 'color' ? (<ColorRangePicker indicators={rangeMapping} setIndicators={rangeMappingSetter}/>)
            : (<RangeInput range={rangeMapping} setRange={rangeMappingSetter}/>)}
        </Setting>
      );
    }
    if (mappingProperty === 'shape') {
      return (expanded) => nodeDataPoints[mappingValue].map((dataPoint) => (
        <Setting key={dataPoint} name={dataPoint}>
          <Select
            options={shapes}
            value={rangeMapping[dataPoint]}
            setSelected={(option) => rangeMappingSetter({...rangeMapping, [dataPoint]: option})}
            parentOpenState={expanded}
            className="overflow-fix"
          />
        </Setting>
      ));
    }
    if (mappingType === 'absolute') {
      if (mappingProperty === 'size') {
        return nodeDataPoints[mappingValue].map((dataPoint) => (
          <Setting key={dataPoint} name={dataPoint}>
            <SmallNumberInput
              value={rangeMapping[dataPoint]}
              setValue={(value) => rangeMappingSetter({...rangeMapping, [dataPoint]: value})}
            />
          </Setting>
        ));
      }
      if (mappingProperty === 'color') {
        return nodeDataPoints[mappingValue].map((dataPoint) => (
          <Setting key={dataPoint} name={dataPoint}>
            <ColorPicker
              color={rangeMapping[dataPoint]}
              setColor={(value) => rangeMappingSetter({...rangeMapping, [dataPoint]: value})}
            />
          </Setting>
        ));
      }
    }
    return null;
  };

  return (
    <div className="settings">
      <ExpandableSetting
        name="Element Color"
        mappingValue={elementColorMappingValue}
        setMappingValue={(mappingValue) => {
          setElementColorMappingValue(mappingValue);
          setElementColorMapIndicators([]);
        }}
        mappingType={elementColorMappingType}
        setMappingType={setElementColorMappingType}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs(
          'color', elementColorMappingValue, elementColorMappingType, elementColorMapIndicators, setElementColorMapIndicators
        )}
      </ExpandableSetting>
      <ExpandableSetting
        name="Element Size"
        mappingValue={elementSizeMappingValue}
        setMappingValue={(mappingValue) => {
          setElementSizeMappingValue(mappingValue);
          setElementSizeMapping([]);
        }}
        mappingType={elementSizeMappingType}
        setMappingType={setElementSizeMappingType}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs('size', elementSizeMappingValue, elementSizeMappingType, elementSizeMapping, setElementSizeMapping)}
      </ExpandableSetting>
      {!performanceMode && (
        <ExpandableSetting
          name="Node Shape"
          mappingValue={nodeShapeMappingValue}
          setMappingValue={setNodeShapeMappingValue}
          dataPoints={nodeDataPoints}
        >
          {createMappingInputs('shape', nodeShapeMappingValue, null, nodeShapeMapping, setNodeShapeMapping)}
        </ExpandableSetting>
      )}
      <ExpandableSetting
        name="Label Color"
        mappingValue={labelColorMappingValue}
        setMappingValue={setLabelColorMappingValue}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs(
          'color', labelColorMappingValue, undefined, labelColorMapIndicators, setLabelColorMapIndicators
        )}
      </ExpandableSetting>
      <ExpandableSetting
        name="Label Size"
        mappingValue={labelSizeMappingValue}
        setMappingValue={setLabelSizeMappingValue}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs('size', labelSizeMappingValue, undefined, labelSizeMapping, setLabelSizeMapping)}
      </ExpandableSetting>
    </div>
  );
};

export default NodeMappingMenu;
