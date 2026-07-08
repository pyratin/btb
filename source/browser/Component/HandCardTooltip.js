import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import * as pixiJs from 'pixi.js';
import { HTMLText, Text } from 'pixi.js';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { gsap } from 'gsap';
import { PixiPlugin as gsapPixiPlugin } from 'gsap/PixiPlugin';
import { useGSAP } from '@gsap/react';

import useStore from '#browser/component/useStore';
import cardModifierConfig from '#browser/component/definition/cardModifier.json';
import Badge from '#browser/Component/Badge';

gsap.registerPlugin(gsapPixiPlugin, useGSAP);
gsapPixiPlugin.registerPIXI(pixiJs);

/** @type {Omit<pixiLayout.LayoutOptions, 'target'>} */
const layout = {
  flexDirection: 'column',
  alignSelf: 'flex-end',
  gap: 2,
  padding: 2,
  borderWidth: 2,
  borderColor: 0xffffff,
  borderRadius: 8,
  backgroundColor: 0x283235
};

/** @type {Omit<pixiLayout.LayoutOptions, 'target'>} */
const _layout = {
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  borderWidth: 0,
  borderColor: 0xff0000,
  borderRadius: 8,
  backgroundColor: 0xeeeeee
};

/** @type {Omit<pixiLayout.LayoutOptions, 'target'>} */
const __layout = {
  justifyContent: 'center',
  alignItems: 'center',
  margin: 2,
  borderRadius: 8,
  padding: 5,
  paddingTop: 0,
  paddingBottom: 0,
  borderWidth: 0,
  borderColor: 0xff0000
};

const style = {
  fontFamily: 'm6x11plus_',
  fontSize: 24,
  fill: 0x000000
};

const _style = {
  ...style,
  align: 'center'
};

const enhancementTextGet = (type) => {
  const config = cardModifierConfig.enhancement[type]?.config || {};

  return (
    {
      bonus: `<chips>+${config.bonus}</chips> extra chips`,
      mult: `<mult>+${config.mult}</mult> Mult`,
      wild: 'Can be used<br />as any suit',
      glass: `<mult>X${config.xMult}</mult> Mult<br /><green>1 in ${config.destroyChance}</green> chance to<br />destroy card`,
      steel: `<mult>X${config.xMultHand}</mult> Mult<br />while this card<br />stays in hand`,
      stone: `<chips>+${config.bonus}</chips> Chips<br />no rank or suit`,
      gold: `<money>$${config.dollarsHand}</money> if this card<br />is held in hand<br />at end of round`,
      lucky: `<green>1 in ${config.multChance}</green> chance<br />for <mult>+${config.mult}</mult> Mult<br /><green>1 in ${config.dollarsChance}</green> chance<br />to win <money>$${config.dollars}</money>`
    }[type] || ''
  );
};

const editionTextGet = (type) => {
  const config = cardModifierConfig.edition[type]?.config || {};

  return (
    {
      folio: `<chips>+${config.bonus}</chips> chips`,
      holographic: `<mult>+${config.mult}</mult> Mult`,
      polychrome: `<mult>X${config.xMult}</mult> Mult`,
      negative: `<negative>+${config.jokerSlot}</negative> Joker slot`
    }[type] || ''
  );
};

const sealTextGet = (type) => {
  const config = cardModifierConfig.seal[type]?.config || {};

  return (
    {
      gold: `Earn <money>$${config.dollars}</money> when this<br />card is played<br />and scores`,
      purple: `Creates a <tarot>Tarot</tarot> card<br />when <attention>discarded</attention><br /><inactive>(Must have room)</inactive>`,
      red: `Retrigger this<br />card <attention>${config.retrigger}</attention> time`,
      blue: `Creates the <planet>Planet</planet> card<br />for final played <attention>poker hand</attention><br />of round if <attention>held</attention> in hand<br /><inactive>(Must have room)</inactive>`
    }[type] || ''
  );
};

const HandCardTooltip = ({
  card: {
    id,
    rank,
    chip,
    suitIndex,
    suit,
    enhancementType,
    editionType,
    sealType
  }
}) => {
  useExtend({ LayoutContainer, HTMLText, Text });

  const { windowInnerDimenesion, minWidth } = useStore(
    useShallow(({ windowInnerDimenesion, cardDimension: { width } }) => ({
      windowInnerDimenesion,
      minWidth: width
    }))
  );

  const ref = useRef(undefined);

  const cardIdRef = useRef(undefined);

  const [marginLeft, marginLeftSet] = useState(undefined);

  useGSAP(
    () => {
      const refCurrent = ref.current;

      gsap.set(refCurrent, { pixi: { alpha: 0 } });

      gsap.to(refCurrent, {
        pixi: { alpha: 1 },
        delay: 0.25,
        duration: 1,
        ease: 'power2.out'
      });
    },
    { dependencies: [] }
  );

  const baseRenderFlag = enhancementType !== 'stone';

  const enhancementRenderFlag = !!enhancementType;

  const editionRenderFlag = !!editionType;

  const sealRenderFlag = !!sealType;

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        bottom: 0,
        marginLeft,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
      alpha={0}
      onLayout={(event) => {
        id !== cardIdRef.current &&
          // eslint-disable-next-line @eslint-react/unsupported-syntax
          (() => {
            marginLeftSet(() => {
              const { right } = event.target.getBounds();

              const { width } = windowInnerDimenesion;

              return right > width ? -(right - width) : 0;
            });

            Object.assign(cardIdRef, { current: id });
          })();
      }}
    >
      {(baseRenderFlag || enhancementRenderFlag) && (
        <Badge layout={{ minWidth, ...layout }}>
          {enhancementRenderFlag && (
            <Badge key='enhancement' layout={_layout}>
              <Badge
                layout={{
                  ...__layout,
                  backgroundColor:
                    {
                      bonus: 0x007bc7,
                      mult: 0xfe5f55,
                      wild: 0x47b247,
                      glass: 0x8aa6a3,
                      steel: 0x5a637c,
                      stone: 0x595959,
                      gold: 0xfecb52,
                      lucky: 0x3a9e3a
                    }[enhancementType] || 0x8689e9
                }}
              >
                <pixiText
                  text={`${_.startCase(enhancementType)} Card`}
                  layout={{}}
                  style={{ ...style, fill: 0xffffff }}
                />
              </Badge>

              <Badge layout={__layout}>
                <pixiHTMLText
                  key={enhancementType}
                  text={enhancementTextGet(enhancementType)}
                  layout={{}}
                  style={{
                    ..._style,
                    tagStyles: {
                      chip: { fill: 0x007bc7 },
                      mult: { fill: 0xfe5f55 },
                      money: { fill: 0xfecb52 },
                      green: { fill: 0x47b247 }
                    }
                  }}
                />
              </Badge>
            </Badge>
          )}

          {baseRenderFlag && (
            <Badge key='base' layout={_layout}>
              <Badge layout={__layout}>
                <pixiHTMLText
                  key={`${rank}-${suit}`}
                  text={`${_.startCase(rank)} of <highlight>${suit}</highlight>`}
                  layout={{}}
                  style={{
                    ..._style,
                    tagStyles: {
                      highlight: {
                        // eslint-disable-next-line @eslint-react/unsupported-syntax
                        fill: (() => {
                          switch (suitIndex) {
                            case 0:
                              return 0xd01d11;

                            case 1:
                              return 0x007bc7;

                            case 2:
                              return 0xc77f00;

                            case 3:
                              return 0x374649;

                            default:
                              return 0x000000;
                          }
                        })()
                      }
                    }
                  }}
                />
              </Badge>

              <Badge layout={__layout}>
                <pixiHTMLText
                  key={chip}
                  text={`<highlight>+${chip}</highlight> chips`}
                  layout={{}}
                  style={{
                    ..._style,
                    tagStyles: {
                      highlight: { fill: 0x007bc7 }
                    }
                  }}
                />
              </Badge>
            </Badge>
          )}
        </Badge>
      )}

      {(editionRenderFlag || sealRenderFlag) && (
        <Badge layout={{ minWidth, ...layout }}>
          {editionRenderFlag && (
            <Badge key='edition' layout={_layout}>
              <Badge
                layout={{
                  ...__layout,
                  backgroundColor:
                    {
                      folio: 0x5a637c,
                      holographic: 0x8689e9,
                      polychrome: 0xc75985,
                      negative: 0x3d3d3d
                    }[editionType] || 0x8689e9
                }}
              >
                <pixiText
                  text={_.startCase(editionType)}
                  layout={{}}
                  style={{ ...style, fill: 0xffffff }}
                />
              </Badge>

              <Badge layout={__layout}>
                <pixiHTMLText
                  key={editionType}
                  text={editionTextGet(editionType)}
                  layout={{}}
                  style={{
                    ..._style,
                    tagStyles: {
                      chip: { fill: 0x007bc7 },
                      mult: { fill: 0xfe5f55 },
                      negative: { fill: 0x5d59a1 }
                    }
                  }}
                />
              </Badge>
            </Badge>
          )}

          {sealRenderFlag && (
            <Badge key='seal' layout={_layout}>
              <Badge
                layout={{
                  ...__layout,
                  backgroundColor:
                    {
                      gold: 0xfecb52,
                      purple: 0x8867a5,
                      red: 0xfe5f55,
                      blue: 0x007bc7
                    }[sealType] || 0x8689e9
                }}
              >
                <pixiText
                  text={`${_.startCase(sealType)} Seal`}
                  layout={{}}
                  style={{ ...style, fill: 0xffffff }}
                />
              </Badge>

              <Badge layout={__layout}>
                <pixiHTMLText
                  key={sealType}
                  text={sealTextGet(sealType)}
                  layout={{}}
                  style={{
                    ..._style,
                    tagStyles: {
                      money: { fill: 0xfecb52 },
                      tarot: { fill: 0xa782d1 },
                      planet: { fill: 0x13afce },
                      attention: { fill: 0xfda200 },
                      inactive: { fill: 0x888888 }
                    }
                  }}
                />
              </Badge>
            </Badge>
          )}
        </Badge>
      )}
    </pixiLayoutContainer>
  );
};

export default HandCardTooltip;
