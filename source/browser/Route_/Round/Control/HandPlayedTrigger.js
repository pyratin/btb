import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import Button from '#browser/Component/Button';

const HandPlayedTrigger = ({ onHandPlayedTrigger }) => {
  useExtend({ LayoutContainer });

  const { disableFlag, onHandPlayedTriggerHandle } = useStore(
    useShallow(({ round: { hand }, onHandPlayedTriggerHandle }) => ({
      disableFlag: !hand.some(({ activeFlag }) => activeFlag),
      onHandPlayedTriggerHandle
    }))
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
        text='Play Hand'
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
          onHandPlayedTriggerHandle();

          onHandPlayedTrigger();
        }}
      />
    </pixiLayoutContainer>
  );
};

export default HandPlayedTrigger;

console.log('HERE> ERROR');
