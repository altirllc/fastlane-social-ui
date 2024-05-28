import React from 'react';
import { Svg, Path } from 'react-native-svg';

export const CheckIcon = ({
  color = '#292B32',
  height = 24,
  width = 24,
}: {
  color?: string;
  height?: number;
  width?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 13L9 18L20 6"
      stroke={color}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
