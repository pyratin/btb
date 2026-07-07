import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { HTMLText } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import Badge from '#browser/Component/Badge';

const HandCardTooltip = ({ card: { id, rank, chip, suitIndex, suit } }) => {
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
          gap: 4,
          padding: 2,
          borderWidth: 2,
          borderColor: 0xffffff,
          borderRadius: 8,
          backgroundColor: 0x283235
        }}
      >
        <pixiLayoutContainer
          layout={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            borderWidth: 0,
            borderColor: 0xff0000
          }}
        >
          <Badge
            layout={{
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
              text={`${_.startCase(rank)} of <highlight>${suit}</highlight>`}
              layout={{}}
              style={{
                fontFamily: 'm6x11plus_',
                fontSize: 24,
                fill: 0x000000,
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

          <Badge
            layout={{
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
              text={`<highlight>+${chip}</highlight> chips`}
              layout={{}}
              style={{
                fontFamily: 'm6x11plus_',
                fontSize: 24,
                fill: 0x000000,
                tagStyles: {
                  highlight: { fill: 0x007bc7 }
                }
              }}
            />
          </Badge>
        </pixiLayoutContainer>
      </Badge>
    </pixiLayoutContainer>
  );
};

export default HandCardTooltip;
