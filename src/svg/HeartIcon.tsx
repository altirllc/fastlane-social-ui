import React from 'react';
import { Svg, Path } from 'react-native-svg';

export const HeartIcon = ({
  color = '#FFFFFF',
  height = 16,
  width = 16,
  stroke = '#14151A',
}: {
  color?: string;
  height?: number;
  width?: number;
  stroke?: string;
}) => (
  // @ts-ignore
  <Svg width={height} height={width} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M7.99992 14C8.66659 14 14.6666 10.6668 14.6666 6.00029C14.6666 3.66704 12.6666 2.02937 10.6666 2.00043C9.66659 1.98596 8.66659 2.33377 7.99992 3.33373C7.33325 2.33377 6.31595 2.00043 5.33325 2.00043C3.33325 2.00043 1.33325 3.66704 1.33325 6.00029C1.33325 10.6668 7.33326 14 7.99992 14Z"
      stroke={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
      fill={color}
    />
  </Svg>
);
