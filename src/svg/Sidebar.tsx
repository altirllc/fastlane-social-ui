import React from 'react';
import { Svg, Path } from 'react-native-svg';

export const SideBarIcon = ({
  color = '#14151A',
  height = 24,
  width = 24,
}: {
  color?: string;
  height?: number;
  width?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H21M3 12H21M3 18H21"
      stroke={color}
      stroke-width="1.5"
      stroke-linecap="round"
      fill={color}
    />
  </Svg>
);
