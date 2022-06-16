import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import ExpandableSetting from '../../../UI/ExpandableSetting/ExpandableSetting';
import {sortArray} from '../../../../utility';
import Setting from '../../../UI/Setting/Setting';
import ColorRangePicker from '../../../UI/ColorRangePicker/ColorRangePicker';
import RangeInput from '../../../UI/RangeInput/RangeInput';
import SmallNumberInput from '../../../UI/SmallNumberInput/SmallNumberInput';
import ColorPicker from '../../../UI/ColorPicker/ColorPicker';

const EdgeMappingMenu = ({
  edgeColorMappingValue, setEdgeColorMappingValue, setEdgeColorMapIndicators, edgeColorMapIndicators, edgeColorMappingType,
  setEdgeColorMappingType,
  edgeSizeMappingValue, setEdgeSizeMappingValue, setEdgeSizeMapping, edgeSizeMappingType, setEdgeSizeMappingType,
  edgeSizeMapping
}) => {
  const {edges} = useSelector((state) => state.network);
  const edgeDataPoints = useMemo(() => {
    const data = {};
    if (edges.length && Object.keys(edges[0].data).length === 0) return {};
    edges.forEach((edge) => {
      Object.keys(edge.data).forEach((dataPoint) => {
        if (dataPoint in data) {
          if (!data[dataPoint].includes(edge.data[dataPoint])) {
            data[dataPoint].push(edge.data[dataPoint]);
          }
        } else {
          data[dataPoint] = [edge.data[dataPoint]];
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
  }, [edges]);
  if (Object.keys(edgeDataPoints).length === 0) {
    return <p className="message">The Edges do not have any data to map against</p>;
  }

  const createMappingInputs = (mappingProperty, mappingValue, mappingType, rangeMapping, rangeMappingSetter) => {
    if (!mappingValue) return null;
    if (mappingType === 'relative') {
      return (
        <Setting name="Range">
          {mappingProperty === 'color'
            ? (<ColorRangePicker indicators={rangeMapping} setIndicators={rangeMappingSetter}/>)
            : (<RangeInput range={rangeMapping} setRange={rangeMappingSetter}/>)}
        </Setting>
      );
    }
    if (mappingType === 'absolute') {
      if (mappingProperty === 'size') {
        return edgeDataPoints[mappingValue].map((dataPoint) => (
          <Setting key={dataPoint} name={dataPoint}>
            <SmallNumberInput
              value={rangeMapping[dataPoint]}
              setValue={(value) => rangeMappingSetter({...rangeMapping, [dataPoint]: value})}
            />
          </Setting>
        ));
      }
      if (mappingProperty === 'color') {
        return edgeDataPoints[mappingValue].map((dataPoint) => (
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
        name="Edge Color"
        mappingValue={edgeColorMappingValue}
        setMappingValue={(mappingValue) => {
          setEdgeColorMappingValue(mappingValue);
          setEdgeColorMapIndicators([]);
        }}
        mappingType={edgeColorMappingType}
        setMappingType={setEdgeColorMappingType}
        dataPoints={edgeDataPoints}
      >
        {createMappingInputs(
          'color', edgeColorMappingValue, edgeColorMappingType, edgeColorMapIndicators, setEdgeColorMapIndicators
        )}
      </ExpandableSetting>
      <ExpandableSetting
        name="Edge Size"
        mappingValue={edgeSizeMappingValue}
        setMappingValue={(mappingValue) => {
          setEdgeSizeMappingValue(mappingValue);
          setEdgeSizeMapping([]);
        }}
        mappingType={edgeSizeMappingType}
        setMappingType={setEdgeSizeMappingType}
        dataPoints={edgeDataPoints}
      >
        {createMappingInputs('size', edgeSizeMappingValue, edgeSizeMappingType, edgeSizeMapping, setEdgeSizeMapping)}
      </ExpandableSetting>
    </div>
  );
};

export default EdgeMappingMenu;
