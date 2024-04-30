import React from 'react';
import { Svg, Path } from 'react-native-svg';

export const PlusIcon = ({ color = '#636878' }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H12M19 12H12M12 12V5M12 12V19"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill={color}
    />
  </Svg>
);
