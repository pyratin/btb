import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { Sprite, NineSliceSprite, Graphics } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend, useApplication } from '@pixi/react';

import useStore from '../component/useStore';

const colorNormalizedGet = (color) => {
  switch (true) {
    case _.isString(color) && color.startsWith('#'): {
      const hex = color.slice(1);

      switch (hex.length) {
        case 8:
          return {
            color: parseInt(hex.slice(0, 6), 16),
            alpha: 1.0 - parseInt(hex.slice(6, 8), 16) / 255
          };

        case 6:
          return {
            color: parseInt(hex, 16),
            alpha: 1.0
          };

        default:
          return { color: 0xffffff, alpha: 1.0 };
      }
    }

    case _.isNumber(color) && color > 0xffffff:
      return {
        color: (color >>> 8) & 0xffffff,
        alpha: 1.0 - (color & 0xff) / 255
      };

    case _.isNumber(color):
      return {
        color,
        alpha: 1.0
      };

    default:
      return {
        color: 0xffffff,
        alpha: 1.0
      };
  }
};

const textureCache = new Map();

const textureGet = (renderer, radius, strokeFlag) => {
  const key = `${radius}-${strokeFlag}`;

  const rendererCache =
    textureCache.get(renderer) ||
    textureCache.set(renderer, new Map()).get(renderer);

  return (
    rendererCache.get(key) ||
    rendererCache
      .set(
        key,
        (() => {
          const g = new Graphics();

          const size = radius * 2 + 6;

          strokeFlag
            ? (() => {
                g.roundRect(1, 1, size - 2, size - 2, radius);

                g.stroke({ width: 2, color: 0xffffff });
              })()
            : (() => {
                g.roundRect(0, 0, size, size, radius);

                g.fill({ color: 0xffffff });
              })();

          const texture = (
            renderer.textureGenerator || renderer
          ).generateTexture({ target: g });

          g.destroy();

          return texture;
        })()
      )
      .get(key)
  );
};

/**
 * Badge component.
 *
 * @param {import('#browser/component/type/Badge').BadgeProps} props The
 *   component props.
 * @returns {import('react').ReactElement} The Badge component.
 */
const Badge = ({
  borderRadius = 8,
  borderColor,
  backgroundColor = 0x3a494f,
  layout,
  children,
  onLayout,
  ...rest
}) => {
  useExtend({ LayoutContainer, Sprite, NineSliceSprite, Graphics });

  const {
    app: { renderer }
  } = useApplication();

  const { textureScaleFactor } = useStore(
    useShallow(({ textureScaleFactor }) => ({
      textureScaleFactor
    }))
  );

  const scaledRadius = borderRadius * textureScaleFactor;

  const nineSliceSpriteOption = useMemo(
    () =>
      ['leftWidth', 'topHeight', 'rightWidth', 'bottomHeight'].reduce(
        (memo, key) => ({
          ...memo,
          [key]: scaledRadius + 2
        }),
        {}
      ),
    [scaledRadius]
  );

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
      onLayout={onLayout}
      {...rest}
    >
      <pixiNineSliceSprite
        texture={textureGet(renderer, scaledRadius, false)}
        {...nineSliceSpriteOption}
        tint={_backgroundColor.color}
        alpha={_backgroundColor.alpha}
        layout={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
      />

      {borderColor && _borderColor.alpha > 0 ? (
        <pixiNineSliceSprite
          texture={textureGet(renderer, scaledRadius, true)}
          {...nineSliceSpriteOption}
          tint={_borderColor.color}
          alpha={_borderColor.alpha}
          layout={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
          }}
        />
      ) : null}

      {children}
    </pixiLayoutContainer>
  );
};

export default Badge;
