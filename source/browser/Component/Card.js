import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Container, Graphics, Sprite } from 'pixi.js';
import { useExtend, useApplication } from '@pixi/react';

import useStore from '#browser/component/useStore';
import cardTextureGet from '#browser/component/utility/cardTextureGet';

const backgroundTextureGet = (cardDimension, renderer) => {
  const { width, height } = cardDimension;

  const bgGraphics = new Graphics()
    .roundRect(0, 0, width, height, 8)
    .fill({ color: 0xf4f0e6 });

  return renderer.textureGenerator.generateTexture({
    target: bgGraphics
  });
};

const Card = ({ card }) => {
  useExtend({ Container, Sprite });

  const {
    app: { renderer }
  } = useApplication();

  const { texture, cardDimension } = useStore(
    useShallow(({ bundle, cardDimension }) => ({
      texture: cardTextureGet(bundle, card),
      cardDimension
    }))
  );

  const [backgroundTexture, backgroundTextureSet] = useState(undefined);

  useEffect(() => {
    const backgroundTexture = backgroundTextureGet(cardDimension, renderer);

    // eslint-disable-next-line @eslint-react/set-state-in-effect
    backgroundTextureSet(backgroundTexture);

    return () => {
      backgroundTexture.destroy(true);
    };
  }, [cardDimension, renderer]);

  return (
    <pixiContainer>
      {backgroundTexture && <pixiSprite texture={backgroundTexture} />}

      <pixiSprite texture={texture} />
    </pixiContainer>
  );
};

export default Card;
