import { useMemo, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { Sprite, NineSliceSprite, Graphics } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

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

/**
 * Badge component.
 *
 * @param {object} props - The component props.
 * @param {number} [props.borderRadius] - The border radius.
 * @param {string | number} [props.borderColor] - The border color.
 * @param {string | number} [props.backgroundColor] - The background color.
 * @param {object} [props.layout] - The layout configuration.
 * @param {import('react').ReactNode} [props.children] - The child elements.
 * @param {(event: object) => void} [props.onLayout] - The layout callback.
 * @param {number} [props.alpha] - The alpha transparency.
 * @param {string} [props.label] - The label for the container.
 * @param {{ x: number, y: number }} [props.position] - The position coordinates.
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

  const { borderOutlineTexture, buttonBackgroundTexture, textureScaleFactor } =
    useStore(
      useShallow(({ bundle, textureScaleFactor }) => ({
        borderOutlineTexture: bundle.miscellaneous.borderOutline,
        buttonBackgroundTexture: bundle.miscellaneous.buttonBackground,
        textureScaleFactor
      }))
    );

  const [size, sizeSet] = useState({ width: 0, height: 0 });

  const onLayoutHandle = useCallback(
    (event) => {
      const { width, height } = event.target.layout._computedLayout;

      sizeSet({ width, height });

      switch (true) {
        case !!onLayout:
          onLayout(event);
          break;
      }
    },
    [onLayout]
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

  const hasBorderFlag = borderColor !== undefined;

  const draw = useCallback(
    (g) => {
      g.clear();

      const scaledRadius = borderRadius * textureScaleFactor;

      switch (true) {
        case _backgroundColor.alpha > 0:
          g.roundRect(1, 1, size.width - 2, size.height - 2, scaledRadius - 1);
          g.fill({
            color: _backgroundColor.color,
            alpha: _backgroundColor.alpha
          });
          break;
      }

      switch (true) {
        case hasBorderFlag && _borderColor.alpha > 0:
          g.roundRect(1, 1, size.width - 2, size.height - 2, scaledRadius - 1);
          g.stroke({
            width: 2,
            color: _borderColor.color,
            alpha: _borderColor.alpha
          });
          break;
      }
    },
    [
      size.width,
      size.height,
      borderRadius,
      textureScaleFactor,
      _backgroundColor,
      _borderColor,
      hasBorderFlag
    ]
  );

  const isSmallRadiusFlag = borderRadius < 16;

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        borderRadius,
        ...layout
      }}
      onLayout={onLayoutHandle}
      {...rest}
    >
      {isSmallRadiusFlag ? (
        <pixiGraphics draw={draw} />
      ) : (
        <>
          <pixiNineSliceSprite
            texture={buttonBackgroundTexture}
            {...nineSliceSpriteOption}
            tint={_backgroundColor.color}
            alpha={_backgroundColor.alpha}
            layout={{
              position: 'absolute',
              left: 1,
              top: 1,
              right: 1,
              bottom: 1
            }}
          />

          {hasBorderFlag ? (
            <pixiNineSliceSprite
              texture={borderOutlineTexture}
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
        </>
      )}

      {children}
    </pixiLayoutContainer>
  );
};

export default Badge;
