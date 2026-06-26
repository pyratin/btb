import { useShallow } from 'zustand/react/shallow';
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
        layout={{
          padding: 20,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 4,
          backgroundColor: 0xf69000
        }}
        style={{
          fontFamily: 'm6x11plus',
          fontSize: 24,
          fill: 0xffffff
        }}
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
