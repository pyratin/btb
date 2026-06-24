import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Sprite, NineSliceSprite, Graphics } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend, useApplication } from '@pixi/react';

import useStore from '../component/useStore';

const textureGet = (renderer, radius, strokeFlag) => {
  const key = `${radius}-${strokeFlag}`;

  renderer.badgeTextureCache = renderer.badgeTextureCache || {};

  const cachedTexture = renderer.badgeTextureCache[key];

  const activeCachedTextureFlag = !!cachedTexture;

  return activeCachedTextureFlag
    ? cachedTexture
    : (() => {
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

        const texture = (renderer.textureGenerator || renderer).generateTexture(
          { target: g }
        );

        g.destroy();

        renderer.badgeTextureCache[key] = texture;

        return texture;
      })();
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
  borderAlpha = 1.0,
  backgroundColor = 0x3a494f,
  backgroundAlpha = 1.0,
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

  const showBorderFlag = !!(borderColor && borderAlpha > 0);

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
        tint={backgroundColor}
        alpha={backgroundAlpha}
        layout={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
      />

      {showBorderFlag ? (
        <pixiNineSliceSprite
          texture={textureGet(renderer, scaledRadius, true)}
          {...nineSliceSpriteOption}
          tint={borderColor}
          alpha={borderAlpha}
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
