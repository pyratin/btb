import React, { useRef, useMemo, useState } from 'react';
import * as pixiJs from 'pixi.js';
import { NineSliceSprite, BitmapText } from 'pixi.js';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { gsap } from 'gsap';
import { PixiPlugin as gsapPixiPlugin } from 'gsap/PixiPlugin';
import { useGSAP } from '@gsap/react';

import Badge from '#browser/Component/Badge';

gsap.registerPlugin(gsapPixiPlugin, useGSAP);
gsapPixiPlugin.registerPIXI(pixiJs);

const disableColor = 0x5d6060;

/**
 * @type {(props: {
 *   text: string;
 *   layout: Omit<pixiLayout.LayoutOptions, 'target'>;
 *   style: pixiJs.TextStyleOptions;
 *   disableFlag?: boolean;
 *   onPointerTap: () => void;
 * }) => React.ReactElement}
 */
const Button = ({ text, layout, style, disableFlag, onPointerTap }) => {
  useExtend({ LayoutContainer, NineSliceSprite, BitmapText });

  const { contextSafe } = useGSAP();

  const ref = useRef(undefined);

  const [hoverFlag, hoverFlagSet] = useState(false);

  const [animationActiveFlag, animationActiveFlagSet] = useState(false);

  const _disableFlag = useMemo(
    () => disableFlag || animationActiveFlag,
    [disableFlag, animationActiveFlag]
  );

  const onPointerEnterLeaveHandle = (event) =>
    hoverFlagSet(event.type === 'pointerenter');

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        top: 5,
        borderWidth: 0,
        borderColor: 0x0000ff
      }}
      {...(_disableFlag
        ? { eventMode: 'none', cursor: 'none' }
        : { eventMode: 'static', cursor: 'pointer' })}
      onPointerEnter={onPointerEnterLeaveHandle}
      onPointerLeave={onPointerEnterLeaveHandle}
      onPointerTap={(event) => {
        event.stopPropagation();

        onPointerTap();

        contextSafe(() => {
          animationActiveFlagSet(true);

          const eventCurrentTarget = event.currentTarget;

          const textContainerElement =
            eventCurrentTarget.getChildByLabel('text-container');

          gsap.to(textContainerElement, {
            pixi: { y: 0 },
            duration: 0.2,
            yoyo: true,
            ease: 'back.out',
            onComplete: () => {
              animationActiveFlagSet(false);
            }
          });
        })();
      }}
    >
      <Badge
        layout={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          ...layout,
          borderWidth: 0,
          borderColor: 0xff0000,
          backgroundColor: 0x000000
        }}
        alpha={0.25}
      />

      <Badge
        label='text-container'
        position={{ x: 0, y: -5 }}
        layout={{
          ...layout,
          ...(disableFlag && { backgroundColor: disableColor })
        }}
        tint={hoverFlag ? 0xdddddd : 0xffffff}
      >
        <pixiBitmapText
          text={text}
          layout={{ top: -5 }}
          style={style}
          alpha={disableFlag ? 0.5 : 1}
        />
      </Badge>
    </pixiLayoutContainer>
  );
};

export default Button;
