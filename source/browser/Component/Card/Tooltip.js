import { useShallow } from 'zustand/react/shallow';
import { HTMLText } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import Badge from '../Badge';

const Tooltip = ({ lastFlag, card: { rank, suit } }) => {
  useExtend({ LayoutContainer, HTMLText });

  const { screenSmallFlag, width, bottom } = useStore(
    useShallow(({ screenSmallFlag, cardDimension: { width, height } }) => ({
      screenSmallFlag,
      width,
      bottom: height + 20
    }))
  );

  return (
    <Badge
      layout={{
        position: 'absolute',
        ...(screenSmallFlag && lastFlag && { right: width / 2.5 }),
        width: '100%',
        bottom,
        justifyContent: 'center',
        padding: 2,
        borderWidth: 2,
        borderColor: 0xffffff,
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
