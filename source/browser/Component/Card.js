import { useShallow } from 'zustand/react/shallow';
import { Container, Sprite } from 'pixi.js';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import cardTextureGet from '#browser/component/utility/cardTextureGet';
import PerspectiveMesh from '#browser/Component/PerspectiveMesh';

const Card = ({
  cursor = 'default',
  idle = false,
  perspectiveMeshDisableFlag = false,
  card
}) => {
  const { id, faceDownFlag, editionType } = card;

  useExtend({ Container, Sprite });

  const { texture, backgroundTexture } = useStore(
    useShallow(({ bundle, cardDimension }) => ({
      texture: cardTextureGet(bundle, card),
      backgroundTexture: bundle._playingCards['_playingCard-1'],
      cardDimension
    }))
  );

  return (
    <PerspectiveMesh
      dirtyKey={`${id}-${faceDownFlag}`}
      animating={!faceDownFlag && !!editionType}
      cursor={cursor}
      idle={idle}
      disableFlag={perspectiveMeshDisableFlag}
    >
      <pixiContainer>
        <pixiSprite texture={backgroundTexture} />

        <pixiSprite texture={texture} />
      </pixiContainer>
    </PerspectiveMesh>
  );
};

export default Card;
