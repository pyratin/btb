import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { HTMLText } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import Badge from '#browser/Component/Badge';

const HandCardTooltip = ({ card: { id, rank, suit } }) => {
  useExtend({ LayoutContainer, HTMLText });

  const { windowInnerDimenesion, cardDimension } = useStore(
    useShallow(({ windowInnerDimenesion, cardDimension }) => ({
      windowInnerDimenesion,
      cardDimension
    }))
  );

  const cardIdRef = useRef(undefined);

  const [right, rightSet] = useState(undefined);

  return (
    <pixiLayoutContainer
      layout={{
        right,
        flex: 1,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
      onLayout={(event) => {
        id !== cardIdRef.current &&
          // eslint-disable-next-line @eslint-react/unsupported-syntax
          (() => {
            rightSet(
              event.target.getBounds().right > windowInnerDimenesion.width
                ? cardDimension.width / 3
                : 0
            );

            Object.assign(cardIdRef, { current: id });
          })();
      }}
    >
      <Badge
        layout={{
          flex: 1,
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
    </pixiLayoutContainer>
  );
};

export default HandCardTooltip;
