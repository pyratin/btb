import { useShallow } from 'zustand/react/shallow';
import { Container, Sprite } from 'pixi.js';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import cardTextureGet from '#browser/component/utility/cardTextureGet';

const Card = ({ card }) => {
  useExtend({ Container, Sprite });

  const { texture, backgroundTexture } = useStore(
    useShallow(({ bundle, cardDimension }) => ({
      texture: cardTextureGet(bundle, card),
      backgroundTexture: bundle._playingCards['_playingCard-1'],
      cardDimension
    }))
  );

  return (
    <pixiContainer>
      <pixiSprite texture={backgroundTexture} />

      <pixiSprite texture={texture} />
    </pixiContainer>
  );
};

export default Card;
