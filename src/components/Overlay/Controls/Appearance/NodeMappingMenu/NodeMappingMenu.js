import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import ExpandableSetting from '../../../UI/ExpandableSetting/ExpandableSetting';
import Setting from '../../../UI/Setting/Setting';
import ColorRangePicker from '../../../UI/ColorRangePicker/ColorRangePicker';
import RangeInput from '../../../UI/RangeInput/RangeInput';
import Select from '../../../UI/Select/Select';
import SmallNumberInput from '../../../UI/SmallNumberInput/SmallNumberInput';
import ColorPicker from '../../../UI/ColorPicker/ColorPicker';
import {sortArray} from '../../../../utility';
import {shapes} from '../../../../constants';

const NodeMappingMenu = ({
  nodeColorMappingValue, setNodeColorMappingValue, setNodeColorMapIndicators, nodeColorMapIndicators,
  nodeColorMappingType, setNodeColorMappingType,
  nodeSizeMappingValue, setNodeSizeMappingValue, setNodeSizeMapping, nodeSizeMappingType, setNodeSizeMappingType,
  nodeSizeMapping,
  nodeShapeMappingValue, setNodeShapeMappingValue, nodeShapeMapping, setNodeShapeMapping,
  labelColorMappingValue, setLabelColorMappingValue, labelColorMappingType, setLabelColorMappingType, labelColorMapIndicators,
  setLabelColorMapIndicators,
  labelSizeMappingValue, setLabelSizeMappingValue, labelSizeMappingType, setLabelSizeMappingType, labelSizeMapping,
  setLabelSizeMapping
}) => {
  const {nodes} = useSelector((state) => state.network);
  const {performanceMode} = useSelector((state) => state.settings);
  /**
   * gets all types of data from the data attribute of the nodes
   */
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

  /**
   * creates inputs for the different types of property settings
   * @param mappingProperty - property of the edge like color or size that should be changed
   * @param mappingValue - property of the edge the change should be based on
   * @param mappingType - relative or absolute mapping
   * @param rangeMapping - the value range provided by the user
   * @param rangeMappingSetter - the setter function for the value range
   * @returns {JSX.Element|null|*} - elements that build the frontend
   */
  const createMappingInputs = (mappingProperty, mappingValue, mappingType, rangeMapping, rangeMappingSetter) => {
    if (!mappingValue) return null;
    if (mappingType === 'relative' && mappingProperty !== 'shape') {
      return (
        <Setting name="Range">
          {mappingProperty === 'color'
            ? (<ColorRangePicker indicators={rangeMapping} setIndicators={rangeMappingSetter}/>)
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
        name="Node Color"
        mappingValue={nodeColorMappingValue}
        setMappingValue={(mappingValue) => {
          setNodeColorMappingValue(mappingValue);
          setNodeColorMapIndicators([]);
        }}
        mappingType={nodeColorMappingType}
        setMappingType={setNodeColorMappingType}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs(
          'color', nodeColorMappingValue, nodeColorMappingType, nodeColorMapIndicators, setNodeColorMapIndicators
        )}
      </ExpandableSetting>
      <ExpandableSetting
        name="Node Size"
        mappingValue={nodeSizeMappingValue}
        setMappingValue={(mappingValue) => {
          setNodeSizeMappingValue(mappingValue);
          setNodeSizeMapping([]);
        }}
        mappingType={nodeSizeMappingType}
        setMappingType={setNodeSizeMappingType}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs('size', nodeSizeMappingValue, nodeSizeMappingType, nodeSizeMapping, setNodeSizeMapping)}
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
        mappingType={labelColorMappingType}
        setMappingType={setLabelColorMappingType}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs(
          'color', labelColorMappingValue, labelColorMappingType, labelColorMapIndicators, setLabelColorMapIndicators
        )}
      </ExpandableSetting>
      <ExpandableSetting
        name="Label Size"
        mappingValue={labelSizeMappingValue}
        setMappingValue={setLabelSizeMappingValue}
        mappingType={labelSizeMappingType}
        setMappingType={setLabelSizeMappingType}
        dataPoints={nodeDataPoints}
      >
        {createMappingInputs('size', labelSizeMappingValue, labelSizeMappingType, labelSizeMapping, setLabelSizeMapping)}
      </ExpandableSetting>
    </div>
  );
};

export default NodeMappingMenu;
