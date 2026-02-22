// src/modules/countingForest/components/ProgressTree.jsx
// Visual tree that grows as child completes activities
import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const ProgressTree = ({ progress }) => {
  const treeHeight = 200 * (progress / 100); // progress from 0-100%
  return (
    <Svg height="250" width="150">
      <Path d={`M75,200 L75,${200-treeHeight} L50,${200-treeHeight+30} L75,${200-treeHeight} L100,${200-treeHeight+30}`} fill="green" />
      <Circle cx="75" cy="200" r="15" fill="brown" />
    </Svg>
  );
};