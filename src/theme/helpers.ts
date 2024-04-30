import { ColorValue } from 'react-native/types';

interface IGetShadowProps {
  offset?: number;
  radius?: number;
  opacity?: number;
  color?: ColorValue;
  noElevation?: boolean;
}

export const getShadowProps = (props?: IGetShadowProps) => {
  const shadowProps = {
    shadowColor: props?.color ?? '#000',
    shadowOffset: {
      width: 0,
      height: props?.offset ?? 2,
    },
    shadowOpacity: props?.opacity ?? 0.2,
    shadowRadius: props?.radius ?? 2,
    elevation: props?.radius ?? 2,
  };

  if (props?.noElevation) {
    return shadowProps;
  }
  return { ...shadowProps, elevation: props?.radius ?? 2 };
};
