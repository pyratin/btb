import { useRef, useMemo, useState } from 'react';
import * as pixiJs from 'pixi.js';
import { BitmapText } from 'pixi.js';
import '@pixi/layout';
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
 * @typedef {object} ButtonPadding
 * @property {number} [padding] - General padding.
 * @property {number} [paddingTop] - Top padding.
 * @property {number} [paddingBottom] - Bottom padding.
 * @property {number} [paddingLeft] - Left padding.
 * @property {number} [paddingRight] - Right padding.
 */

/**
 * Button component.
 *
 * @param {object} props - The component props.
 * @param {string} props.text - The button text.
 * @param {number} props.fontSize - The font size.
 * @param {ButtonPadding} props.padding - The button padding configuration.
 * @param {number} [props.borderRadius] - The border radius.
 * @param {string | number} [props.backgroundColor] - The background color.
 * @param {boolean} [props.disableFlag] - Disable button flag.
 * @param {() => void} props.onPointerTap - Tap callback.
 * @returns {import('react').ReactElement} The Button component.
 */
const Button = ({
  text,
  fontSize,
  padding,
  borderRadius = 8,
  backgroundColor,
  disableFlag = false,
  onPointerTap
}) => {
  useExtend({ LayoutContainer, BitmapText });

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

          gsap.timeline()
            .to(textContainerElement, {
              pixi: { y: 0 },
              duration: 0.1,
              ease: 'power1.out'
            })
            .to(textContainerElement, {
              pixi: { y: -5 },
              duration: 0.15,
              ease: 'back.out',
              onComplete: () => {
                animationActiveFlagSet(false);
              }
            });
        })();
      }}
    >
      {/* Shadow */}
      <Badge
        borderRadius={borderRadius}
        backgroundColor='#00000000'
        layout={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
        alpha={0.25}
      />

      {/* Button face */}
      <Badge
        label='text-container'
        position={{ x: 0, y: -5 }}
        borderRadius={borderRadius}
        backgroundColor={disableFlag ? disableColor : backgroundColor}
        layout={{
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          ...padding,
          borderWidth: 0,
          borderColor: 0xff0000
        }}
      >
        {hoverFlag && (
          <Badge
            borderRadius={borderRadius}
            backgroundColor='#00000000'
            layout={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%'
            }}
            alpha={0.2}
          />
        )}

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
      </Badge>
    </pixiLayoutContainer>
  );
};

export default Button;
