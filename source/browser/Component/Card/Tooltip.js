import { useShallow } from 'zustand/react/shallow';
import { HTMLText } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import Badge from '../Badge';

const Tooltip = ({ card: { rank, suit, firstFlag, lastFlag } }) => {
  useExtend({ LayoutContainer, HTMLText });

  const { smallScreenFlag, bottom } = useStore(
    useShallow(({ smallScreenFlag, cardDimension: { height } }) => ({
      smallScreenFlag,
      bottom: height + 10
    }))
  );

  console.log('HERE>', firstFlag, lastFlag, smallScreenFlag);

  return (
    <Badge
      layout={{
        position: 'absolute',
        width: '100%',
        bottom,
        justifyContent: 'center',
        padding: 2,
        borderWidth: 1,
        borderColor: 0xff0000,
        borderRadius: 8,
        backgroundColor: 0x283235
      }}
    >
      <Badge
        layout={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 5,
          paddingTop: 0,
          paddingBottom: 0,
          borderWidth: 0,
          borderRadius: 8,
          borderColor: 0xff0000,
          backgroundColor: 0xeeeeee
        }}
      >
        <pixiHTMLText
          text={`${rank} of ${suit}`}
          layout={{}}
          style={{
            fontFamily: 'm6x11plus_',
            fontSize: 24,
            fill: 0x000000,
            tagStyles: {}
          }}
        />
      </Badge>
    </Badge>
  );
};

export default Tooltip;
