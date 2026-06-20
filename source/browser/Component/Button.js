import { useRef, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiJs from 'pixi.js';
import { NineSliceSprite, BitmapText } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { gsap } from 'gsap';
import { PixiPlugin as gsapPixiPlugin } from 'gsap/PixiPlugin';
import { useGSAP } from '@gsap/react';

import useStore from '#browser/component/useStore';

gsap.registerPlugin(gsapPixiPlugin, useGSAP);
gsapPixiPlugin.registerPIXI(pixiJs);

const disableColor = 0x5d6060;

const nineSliceSpriteOption = [
  'leftWidth',
  'topHeight',
  'rightWidth',
  'bottomHeight'
].reduce((memo, key) => ({ ...memo, [key]: 4 }), {});

const Button = ({
  text,
  fontSize,
  padding,
  borderRadius = 8,
  backgroundColor,
  disableFlag = false,
  onPointerTap
}) => {
  useExtend({ LayoutContainer, NineSliceSprite, BitmapText });

  const { contextSafe } = useGSAP();

  const { texture } = useStore(
    useShallow(({ bundle }) => ({
      texture: bundle.miscellaneous.buttonBackground
    }))
  );

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
        width: '100%',
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
            ease: 'back.out',
            onComplete: () => {
              animationActiveFlagSet(false);
            }
          });
        })();
      }}
    >
      <pixiNineSliceSprite
        texture={texture}
        {...nineSliceSpriteOption}
        layout={{ position: 'absolute', width: '100%', height: '100%' }}
        tint={0x000000}
        alpha={0.25}
      />

      <pixiLayoutContainer
        label='text-container'
        position={{ x: 0, y: -5 }}
        layout={{
          position: 'relative',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          ...padding,
          borderWidth: 0,
          borderColor: 0xff0000,
          borderRadius
        }}
      >
        <pixiNineSliceSprite
          texture={texture}
          {...nineSliceSpriteOption}
          layout={{ position: 'absolute', width: '100%', height: '100%' }}
          tint={disableFlag ? disableColor : backgroundColor}
        />

        <pixiNineSliceSprite
          texture={texture}
          {...nineSliceSpriteOption}
          layout={{ position: 'absolute', width: '100%', height: '100%' }}
          tint={0x000000}
          alpha={hoverFlag ? 0.2 : 0}
        />

        <pixiBitmapText
          text={text}
          layout={{ top: -4 }}
          style={{
            fontFamily: 'm6x11plus',
            fontSize,
            fill: 0xffffff
          }}
          alpha={disableFlag ? 0.5 : 1}
        />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Button;
