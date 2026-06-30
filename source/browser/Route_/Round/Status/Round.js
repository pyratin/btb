import { useShallow } from 'zustand/react/shallow';
import * as pixiJs from 'pixi.js';
import { BitmapText, HTMLText } from 'pixi.js';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore.js';
import blindTypeDefinitionCollection from '#browser/component/definition/blindType.json';
import Badge from '#browser/Component/Badge';

const __layout = /** @type {pixiLayout.LayoutStyles} */ ({
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  gap: 5,
  padding: 10,
  borderWidth: 0,
  borderColor: 0xff0000,
  backgroundColor: 0x283235
});

const _layout = /** @type {pixiLayout.LayoutStyles} */ ({ top: -6 });

const layout = /** @type {pixiLayout.LayoutStyles} */ ({
  padding: 10,
  paddingTop: 5,
  paddingBottom: 5,
  borderRadius: 4,
  borderWidth: 0,
  borderColor: 0xff0000,
  backgroundColor: 0x3e494c
});

const style = /** @type {pixiJs.TextStyleOptions} */ ({
  fontFamily: 'm6x11plus',
  fontSize: 24,
  fill: 0xffffff
});

const _style = /** @type {pixiJs.TextStyleOptions} */ ({
  fontFamily: 'm6x11plus_',
  fontSize: 24,
  fill: 0xffffff,
  tagStyles: {
    highlight: { fill: '#ffa832' },
    info: { fill: '#53b0ff' },
    danger: { fill: '#fa5546' }
  }
});

const Round = () => {
  useExtend({ LayoutContainer, BitmapText, HTMLText });

  const {
    roundCountMaximum,
    handPlayedCountMaximum,
    discardCountMaximum,
    cash,
    index,
    handPlayedCount,
    discardCount
  } = useStore(
    useShallow(
      ({
        roundCountMaximum,
        handPlayedCountMaximum,
        discardCountMaximum,
        cash,
        round: { index, handPlayedCount, discardCount }
      }) => ({
        roundCountMaximum,
        handPlayedCountMaximum,
        discardCountMaximum,
        cash,
        index,
        handPlayedCount,
        discardCount
      })
    )
  );

  return (
    <>
      <pixiLayoutContainer layout={__layout}>
        <pixiLayoutContainer>
          <pixiBitmapText text='Hands' layout={_layout} style={style} />
        </pixiLayoutContainer>

        <Badge layout={layout}>
          <pixiHTMLText
            text={`<info>${handPlayedCountMaximum - handPlayedCount}</info>`}
            layout={{}}
            style={_style}
            resolution={1}
          />
        </Badge>
      </pixiLayoutContainer>

      <pixiLayoutContainer layout={__layout}>
        <pixiBitmapText text='Discards' layout={_layout} style={style} />

        <Badge layout={layout}>
          <pixiHTMLText
            text={`<danger>${discardCountMaximum - discardCount}</danger>`}
            layout={{}}
            style={_style}
            resolution={1}
          />
        </Badge>
      </pixiLayoutContainer>

      <pixiLayoutContainer layout={__layout}>
        <pixiBitmapText text='Cash' layout={_layout} style={style} />

        <Badge layout={layout}>
          <pixiHTMLText
            text={`<highlight>$ ${cash}</highlight>`}
            layout={{}}
            style={_style}
            resolution={1}
          />
        </Badge>
      </pixiLayoutContainer>

      <pixiLayoutContainer layout={__layout}>
        <pixiLayoutContainer layout={{}}>
          <pixiBitmapText text='Ante' layout={_layout} style={style} />
        </pixiLayoutContainer>

        <Badge layout={layout}>
          <pixiHTMLText
            text={`<highlight>${
              Math.floor(index / blindTypeDefinitionCollection.length) + 1
            }</highlight> / ${
              roundCountMaximum / blindTypeDefinitionCollection.length
            }`}
            layout={{}}
            style={_style}
            resolution={1}
          />
        </Badge>
      </pixiLayoutContainer>

      <pixiLayoutContainer layout={__layout}>
        <pixiLayoutContainer>
          <pixiBitmapText text='Round' layout={_layout} style={style} />
        </pixiLayoutContainer>

        <Badge layout={layout}>
          <pixiHTMLText
            text={`<highlight>${index + 1}</highlight>`}
            layout={{}}
            style={_style}
            resolution={1}
          />
        </Badge>
      </pixiLayoutContainer>
    </>
  );
};

export default Round;
