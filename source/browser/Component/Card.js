import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
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

  useExtend({ LayoutContainer, Container, Sprite });

  const { backgroundTexture, texture, enhancementTexture, sealTexture } =
    useStore(
      useShallow(({ bundle }) => ({
        backgroundTexture: bundle._playingCards['_playingCard-1'],
        texture: cardTextureGet(bundle, card),
        enhancementTexture:
          bundle._playingCards[`_playingCard-${card.enhancementType}`],
        sealTexture: bundle._playingCards[`_playingCard-${card.sealType}-seal`]
      }))
    );

  return (
    <pixiLayoutContainer
      layout={{
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <pixiSprite
        label='shadow'
        texture={backgroundTexture}
        {...shadowConfiguration}
      />

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
            <pixiSprite
              texture={
                (!faceDownFlag && enhancementTexture) || backgroundTexture
              }
              tint={0xeeeeee}
            />

            {card.enhancementType !== 'stone' && (
              <pixiSprite texture={texture} />
            )}
          </pixiContainer>
        </Edition>

        {card.sealType && <pixiSprite texture={sealTexture} />}
      </PerspectiveMesh>
    </pixiLayoutContainer>
  );
};

export default Card;
