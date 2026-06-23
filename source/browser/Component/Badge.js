import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { Sprite, NineSliceSprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '../component/useStore';

const colorNormalizedGet = (color) => {
  switch (true) {
    case _.isString(color) && color.startsWith('#'):
      return parseInt(color.slice(1), 16);

    default:
      return color;
  }
};

/**
 * @param {object} props
 * @param {number} [props.borderRadius]
 * @param {string|number} [props.borderColor]
 * @param {string|number} [props.backgroundColor]
 * @param {object} [props.layout]
 * @param {import('react').ReactNode} [props.children]
 */
const Badge = ({
  borderRadius = 8,
  borderColor = 0xffffff,
  backgroundColor = 0x3a494f,
  layout,
  children,
  ...rest
}) => {
  useExtend({ LayoutContainer, Sprite, NineSliceSprite });

  const { borderOutlineTexture, buttonBackgroundTexture, textureScaleFactor } = useStore(
    useShallow(({ bundle, textureScaleFactor }) => ({
      borderOutlineTexture: bundle.miscellaneous.borderOutline,
      buttonBackgroundTexture: bundle.miscellaneous.buttonBackground,
      textureScaleFactor
    }))
  );

  const nineSliceSpriteOption = useMemo(() => {
    return ['leftWidth', 'topHeight', 'rightWidth', 'bottomHeight'].reduce(
      (memo, key) => ({ ...memo, [key]: borderRadius * textureScaleFactor }),
      {}
    );
  }, [borderRadius, textureScaleFactor]);

  const _borderColor = useMemo(
    () => colorNormalizedGet(borderColor),
    [borderColor]
  );

  const _backgroundColor = useMemo(
    () => colorNormalizedGet(backgroundColor),
    [backgroundColor]
  );

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        borderRadius,
        ...layout
      }}
      {...rest}
    >
      <pixiNineSliceSprite
        texture={buttonBackgroundTexture}
        {...nineSliceSpriteOption}
        tint={_backgroundColor}
        layout={{
          position: 'absolute',
          left: 1,
          top: 1,
          right: 1,
          bottom: 1
        }}
      />

      <pixiNineSliceSprite
        texture={borderOutlineTexture}
        {...nineSliceSpriteOption}
        tint={_borderColor}
        layout={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
      />

      {children}
    </pixiLayoutContainer>
  );
};

export default Badge;
