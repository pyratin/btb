import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { HTMLText } from 'pixi.js';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import cardModifierConfig from '#browser/component/definition/cardModifier.json';
import Badge from '#browser/Component/Badge';

/** @type {Omit<pixiLayout.LayoutOptions, 'target'>} */
const layout = {
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  borderWidth: 0,
  borderColor: 0xff0000,
  borderRadius: 8,
  backgroundColor: 0xeeeeee
};

/** @type {Omit<pixiLayout.LayoutOptions, 'target'>} */
const _layout = {
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
  fill: 0x000000,
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

const HandCardTooltip = ({
  card: { id, rank, chip, suitIndex, suit, enhancementType }
}) => {
  useExtend({ LayoutContainer, HTMLText });

  const { windowInnerDimenesion, minWidth } = useStore(
    useShallow(({ windowInnerDimenesion, cardDimension: { width } }) => ({
      windowInnerDimenesion,
      minWidth: width
    }))
  );

  const cardIdRef = useRef(undefined);

  const [marginLeft, marginLeftSet] = useState(undefined);

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        bottom: 0,
        marginLeft,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
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
      <Badge
        layout={{
          minWidth,
          flexDirection: 'column',
          gap: 2,
          padding: 2,
          borderWidth: 2,
          borderColor: 0xffffff,
          borderRadius: 8,
          backgroundColor: 0x283235
        }}
      >
        {enhancementType && (
          <Badge layout={layout}>
            <Badge
              layout={{
                ..._layout,
                backgroundColor: 0x8689e9
              }}
            >
              <pixiHTMLText
                text={`${_.startCase(enhancementType)} Card`}
                layout={{}}
                style={{ ...style, fill: 0xffffff }}
              />
            </Badge>

            <Badge layout={_layout}>
              <pixiHTMLText
                text={enhancementTextGet(enhancementType)}
                layout={{}}
                style={{
                  ...style,
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

        {enhancementType !== 'stone' && (
          <Badge layout={layout}>
            <Badge layout={_layout}>
              <pixiHTMLText
                text={`${_.startCase(rank)} of <highlight>${suit}</highlight>`}
                layout={{}}
                style={{
                  ...style,
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

            <Badge layout={_layout}>
              <pixiHTMLText
                text={`<highlight>+${chip}</highlight> chips`}
                layout={{}}
                style={{
                  ...style,
                  tagStyles: {
                    highlight: { fill: 0x007bc7 }
                  }
                }}
              />
            </Badge>
          </Badge>
        )}
      </Badge>
    </pixiLayoutContainer>
  );
};

export default HandCardTooltip;
