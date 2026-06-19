import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import Button from '#browser/Component/Button';

const DiscardTrigger = ({ onDiscardTrigger }) => {
  useExtend({ LayoutContainer });

  const { disableFlag, onHandCardDiscardTriggerHandle } = useStore(
    useShallow(
      ({
        discardCountMaximum,
        round: { hand, discardCount },
        onHandCardDiscardTriggerHandle
      }) => ({
        disableFlag:
          !hand.some(({ activeFlag }) => activeFlag) ||
          discardCount === discardCountMaximum,
        onHandCardDiscardTriggerHandle
      })
    )
  );

  return (
    <pixiLayoutContainer
      layout={{
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <Button
        text='Discard'
        fontSize={24}
        padding={{ padding: 2 }}
        backgroundColor={0xf7473d}
        disableFlag={disableFlag}
        onPointerTap={() => {
          onHandCardDiscardTriggerHandle();

          onDiscardTrigger();
        }}
      />
    </pixiLayoutContainer>
  );
};

export default DiscardTrigger;
