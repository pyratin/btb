import { useShallow } from 'zustand/react/shallow';
import * as pixiJs from 'pixi.js';
import { BitmapText, HTMLText } from 'pixi.js';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import roundScoreTargetGet from '#browser/component/utility/roundScoreTargetGet';
import Badge from '#browser/Component/Badge';

/** @type {pixiLayout.LayoutStyles} */
const __layout = {
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  gap: 5,
  padding: 10,
  borderWidth: 0,
  borderColor: 0xff0000,
  backgroundColor: 0x283235
};

const _layout = /** @type {pixiJs.TextStyleOptions} */ ({ top: -6 });

const layout = /** @type {pixiLayout.LayoutStyles} */ ({
  flex: 1,
  justifyContent: 'center',
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

const Score = () => {
  useExtend({ LayoutContainer, BitmapText, HTMLText });

  const { roundIndex } = useStore(
    useShallow(({ round: { index } }) => ({ roundIndex: index }))
  );

  return (
    <pixiLayoutContainer layout={__layout}>
      <pixiLayoutContainer layout={{}}>
        <pixiBitmapText text='Round Score' layout={_layout} style={style} />
      </pixiLayoutContainer>

      <pixiLayoutContainer layout={{ width: '100%', justifyContent: 'center' }}>
        <Badge layout={layout}>
          <pixiHTMLText
            text={`0 / <danger>${roundScoreTargetGet(roundIndex)}</danger>`}
            layout={{}}
            style={_style}
            resolution={1}
          />
        </Badge>
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Score;
