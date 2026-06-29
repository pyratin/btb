import React from 'react';
import { Sprite, Graphics } from 'pixi.js';
import * as pixiJs from 'pixi.js';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

/**
 * @type {(
 *   props: {
 *     layout: pixiLayout.LayoutStyles;
 *     children?: React.ReactNode;
 *   } & Omit<pixiJs.ContainerOptions, 'children'>
 * ) => React.ReactElement}
 */
const Badge = ({ layout, children = undefined, ...rest }) => {
  useExtend({ LayoutContainer, Sprite, Graphics });

  return (
    <pixiLayoutContainer layout={layout} {...rest}>
      {children}
    </pixiLayoutContainer>
  );
};

export default Badge;
