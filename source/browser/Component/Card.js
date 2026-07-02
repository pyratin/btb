import { useShallow } from 'zustand/react/shallow';
import { Container, Sprite } from 'pixi.js';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import cardTextureGet from '#browser/component/utility/cardTextureGet';
import PerspectiveMesh from '#browser/Component/PerspectiveMesh';
import Edition from '#browser/Component/Edition';

/**
 * @param {import('#browser/component/type/Card').CardProps} props The component
 *   properties.
 * @returns {import('react').ReactElement} The rendered Card React element.
 */
const Card = ({
  cursor = 'default',
  idle = false,
  perspectiveMeshDisableFlag = false,
  shadowConfiguration,
  card,
  ref
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
    <pixiContainer>
      <pixiSprite texture={backgroundTexture} {...shadowConfiguration} />

      <PerspectiveMesh
        ref={ref}
        dirtyKey={`${id}-${faceDownFlag}`}
        animating={!faceDownFlag && !!editionType}
        cursor={cursor}
        idle={idle}
        disableFlag={perspectiveMeshDisableFlag}
      >
        <Edition type={!faceDownFlag && editionType}>
          <pixiContainer>
            <pixiSprite texture={backgroundTexture} />

            <pixiSprite texture={texture} />
          </pixiContainer>
        </Edition>
      </PerspectiveMesh>
    </pixiContainer>
  );
};

export default Card;
