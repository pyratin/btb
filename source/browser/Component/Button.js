import { useRef, useMemo, useState } from 'react';
import * as pixiJs from 'pixi.js';
import { Text, Graphics } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { DropShadowFilter } from 'pixi-filters';
import { gsap } from 'gsap';
import { PixiPlugin as gsapPixiPlugin } from 'gsap/PixiPlugin';
import { useGSAP } from '@gsap/react';

import animationDefinitionProcessedGet from '#browser/component/utility/animationDefinitionProcessedGet';
import onAnimationDefinitionUpdateHandle from '#browser/component/utility/onAnimationDefinitionUpdateHandle';

gsap.registerPlugin(gsapPixiPlugin, useGSAP);
gsapPixiPlugin.registerPIXI(pixiJs);

const disableColor = 0x5d6060;

const filters = [
  new DropShadowFilter({
    offset: { x: -1, y: 2 },
    blur: 0,
    alpha: 0.25,
    antialias: true
  })
];

const Button = ({
  text,
  fontSize,
  padding,
  borderRadius = 8,
  backgroundColor,
  disableFlag = false,
  onPointerTap
}) => {
  useExtend({ LayoutContainer, Text, Graphics });

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

          const { layout: { style: { top = 0 } = {} } = {} } =
            textContainerElement;

          const animationDefinition = {
            from: /** @type {pixiJs.ContainerOptions} */ ({ layout: { top } }),
            to: /** @type {pixiJs.ContainerOptions} */ ({ layout: { top: 0 } })
          };

          const [target, to] =
            animationDefinitionProcessedGet(animationDefinition);

          gsap.to(target, {
            ...to,
            duration: 0.2,
            yoyo: true,
            ease: 'back.out',
            onUpdate: () => {
              onAnimationDefinitionUpdateHandle(
                target,
                animationDefinition.to,
                textContainerElement
              );
            },
            onComplete: () => {
              animationActiveFlagSet(false);
            }
          });
        })();
      }}
    >
      <pixiLayoutContainer
        layout={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderWidth: 0,
          borderColor: 0xff0000
        }}
        onLayout={(event) => {
          const eventTarget = event.target;

          const graphics = /** @type {Graphics} */ (eventTarget.getChildAt(0));

          graphics
            .clear()
            .roundRect(
              // eslint-disable-next-line @eslint-react/unsupported-syntax
              ...(() => {
                const {
                  layout: {
                    _computedLayout: { width, height }
                  }
                } = eventTarget;

                return /** @type {const} */ ([
                  0,
                  0,
                  width,
                  height,
                  borderRadius
                ]);
              })()
            )
            .fill({ color: 0x000000, alpha: 0.25 });
        }}
      >
        <pixiGraphics draw={() => {}} layout={{ position: 'absolute' }} />
      </pixiLayoutContainer>

      <pixiLayoutContainer
        label='text-container'
        layout={{
          position: 'relative',
          top: -5,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          ...padding,
          borderWidth: 0,
          borderColor: 0xff0000,
          borderRadius,
          backgroundColor: disableFlag ? disableColor : backgroundColor
        }}
      >
        <pixiLayoutContainer
          layout={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderWidth: 0,
            borderColor: 0x000000,
            backgroundColor: 0x000000
          }}
          alpha={hoverFlag ? 0.2 : 0}
        ></pixiLayoutContainer>

        <pixiText
          text={text}
          layout={{}}
          style={{
            fontFamily: 'm6x11plus',
            fontSize,
            fill: 0xffffff
          }}
          alpha={disableFlag ? 0.5 : 1}
          filters={filters}
        />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Button;
