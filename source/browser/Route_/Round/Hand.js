import { useShallow } from 'zustand/react/shallow';
import { Container, Graphics } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { DropShadowFilter } from 'pixi-filters';

import useStore from '#browser/component/useStore';
import Card from '#browser/Component/Card';

const Hand = () => {
  useExtend({ LayoutContainer, Container, Graphics });

  const { hand, cardDimension } = useStore(
    useShallow(({ round: { hand }, cardDimension }) => ({
      hand,
      cardDimension
    }))
  );

  return (
    <pixiLayoutContainer
      layout={{
        // eslint-disable-next-line @eslint-react/unsupported-syntax
        ...(() => {
          const { height } = cardDimension;

          return { height };
        })(),
        marginTop: 'auto',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
      onLayout={(event) => {
        const eventTarget = event.target;

        const { layout: { _computedLayout: { width: _width = 0 } = {} } = {} } =
          eventTarget;

        const cardWidthFactor = 0.75;

        const width = Math.min(
          ...[_width / hand.length, cardDimension.width * cardWidthFactor].map(
            (cardWidth) => cardWidth * hand.length
          )
        );

        const cardWidth = width / hand.length;

        const _offset = Math.abs(_width - width) / 2;

        const __offset = _offset
          ? ((1 - cardWidthFactor) * cardDimension.width) / 2
          : 0;

        const offset = _offset - __offset;

        eventTarget.children
          .find(({ children }) => children.length)
          .children.map((container, index) => {
            Object.assign(container, {
              position: { x: offset + cardWidth * index, y: 0 }
            });
          });
      }}
    >
      {hand.map((card) => {
        return (
          <pixiContainer key={card.id} eventMode='static' cursor='pointer'>
            <pixiGraphics
              draw={(graphics) => {
                graphics
                  .rect(
                    // eslint-disable-next-line @eslint-react/unsupported-syntax
                    ...(() => {
                      const { width, height } = cardDimension;

                      return /** @type {const} */ ([0, 0, width, height]);
                    })()
                  )
                  .fill({ color: 0xff0000 });
              }}
              filters={[
                new DropShadowFilter({
                  offset: { x: -5, y: 5 },
                  shadowOnly: true
                })
              ]}
            />

            <Card card={card} />
          </pixiContainer>
        );
      })}
    </pixiLayoutContainer>
  );
};

export default Hand;
