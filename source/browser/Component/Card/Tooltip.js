import { useShallow } from 'zustand/react/shallow';
import { HTMLText } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';

const Tooltip = ({ card: { rank, suit } }) => {
  useExtend({ LayoutContainer, HTMLText });

  const { bottom } = useStore(
    useShallow(({ cardDimension: { height } }) => ({
      bottom: height + 10
    }))
  );

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        width: '100%',
        bottom,
        justifyContent: 'center',
        padding: 2,
        borderWidth: 0,
        borderColor: 0xff0000,
        backgroundColor: 0x283235
      }}
    >
      <pixiLayoutContainer
        layout={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 5,
          borderWidth: 0,
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
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Tooltip;
