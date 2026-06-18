import { useShallow } from 'zustand/react/shallow';
import { Container, Graphics, Sprite } from 'pixi.js';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import cardTextureGet from '#browser/component/utility/cardTextureGet';

const Card = ({ card }) => {
  useExtend({ Container, Graphics, Sprite });

  const { texture, cardDimension } = useStore(
    useShallow(({ bundle, cardDimension }) => ({
      texture: cardTextureGet(bundle, card),
      cardDimension
    }))
  );

  return (
    <pixiContainer>
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .roundRect(
              // eslint-disable-next-line @eslint-react/unsupported-syntax
              ...(() => {
                const { width, height } = cardDimension;

                return /** @type {const} * */ ([0, 0, width, height, 8]);
              })()
            )
            .fill({ color: 0xf4f0e6 })
        }
      />

      <pixiSprite texture={texture} />
    </pixiContainer>
  );
};

export default Card;
