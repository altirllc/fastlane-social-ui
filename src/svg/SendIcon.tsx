import React from 'react';
import { Svg, Path, Defs, ClipPath, Rect, G } from 'react-native-svg';

export const SendIcon = ({
  strokeColor = '#2F384C',
  height = 24,
  width = 24,
}: {
  strokeColor?: string;
  height?: number;
  width?: number;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Defs>
      <ClipPath id="clip0">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
    <G clipPath="url(#clip0)">
      <Path
        d="M11 13L12.5345 16.9899C13.5893 19.7326 14.1168 21.1039 14.825 21.4489C15.4375 21.7472 16.1598 21.7132 16.7415 21.3586C17.4142 20.9486 17.8104 19.5338 18.6027 16.7041L21.466 6.47824C21.9677 4.68672 22.2185 3.79096 21.9857 3.17628C21.7827 2.64035 21.3596 2.21724 20.8237 2.01427C20.209 1.78147 19.3133 2.03228 17.5217 2.53391L7.29584 5.39716C4.46617 6.18947 3.05133 6.58563 2.64136 7.25828C2.28678 7.84005 2.25275 8.56231 2.55106 9.17484C2.89597 9.88306 4.26729 10.4105 7.00993 11.4654L11 13ZM11 13L13.5 10.5"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);
