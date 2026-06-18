import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import Card from '#browser/Component/Card';

const Hand = () => {
  useExtend({ LayoutContainer });

  const { hand } = useStore(useShallow(({ round: { hand } }) => ({ hand })));

  return (
    <pixiLayoutContainer
      layout={{
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      {hand.map((card) => {
        return (
          <pixiLayoutContainer key={card.id} layout={{}}>
            <Card card={card} />
          </pixiLayoutContainer>
        );
      })}
    </pixiLayoutContainer>
  );
};

export default Hand;
