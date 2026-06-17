import { useShallow } from 'zustand/react/shallow';
import { Sprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import cardTextureGet from '#browser/component/utility/cardTextureGet';
import PerspectiveMesh from '#browser/Component/PerspectiveMesh';
import Edition from '#browser/Component/Edition';

const Card = ({
  cursor = 'default',
  idle = false,
  perspectiveMeshDisableFlag = false,
  card
}) => {
  const { id, faceDownFlag, editionType } = card;

  useExtend({ LayoutContainer, Sprite });

  const { texture } = useStore(
    useShallow(({ bundle }) => ({ texture: cardTextureGet(bundle, card) }))
  );

  return (
    <pixiLayoutContainer
      layout={{
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
      eventMode='passive'
    >
      <PerspectiveMesh
        dirtyKey={`${id}-${faceDownFlag}`}
        animating={!faceDownFlag && !!editionType}
        cursor={cursor}
        idle={idle}
        disableFlag={perspectiveMeshDisableFlag}
      >
        <Edition type={!faceDownFlag && editionType}>
          <pixiLayoutContainer
            layout={{
              borderWidth: 0,
              borderColor: 0x00ff00,
              borderRadius: 8,
              backgroundColor: 0xf4f0e6
            }}
          >
            <pixiSprite texture={texture} layout={{}} />
          </pixiLayoutContainer>
        </Edition>
      </PerspectiveMesh>
    </pixiLayoutContainer>
  );
};

export default Card;
