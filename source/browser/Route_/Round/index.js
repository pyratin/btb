import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore.js';
import { BACKGROUND_PRESETS } from '#browser/component/definition/backgroundPresets';
import Background from '#browser/Component/Background';
import Hand from './Hand';
import Control from './Control';

const Round = () => {
  useExtend({ LayoutContainer });

  const { handSet } = useStore(useShallow(({ handSet }) => ({ handSet })));

  const [sortTriggerFlag, sortTriggerFlagSet] = useState(false);

  const [discardTriggerFlag, discardTriggerFlagSet] = useState(false);

  const [handPlayedTriggerFlag, handPlayedTriggerFlagSet] = useState(false);

  const [activeFlagClearTrigger, activeFlagClearTriggerSet] = useState(false);

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        borderWidth: 0,
        borderColor: 0xffffff
      }}
    >
      <pixiLayoutContainer
        layout={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderWidth: 0,
          borderColor: 0xffffff
        }}
        onPointerTap={() => {
          handSet((hand) =>
            hand.map((card) => ({ ...card, activeFlag: false }))
          );

          activeFlagClearTriggerSet(true);
        }}
      >
        <Background {...BACKGROUND_PRESETS.DEFAULT} />
      </pixiLayoutContainer>

      <pixiLayoutContainer
        layout={{
          width: '100%',
          flexDirection: 'column',
          gap: 25,
          marginTop: 'auto',
          borderWidth: 0,
          borderColor: 0xff0000
        }}
      >
        <Hand
          sortTriggerFlag={sortTriggerFlag}
          discardTriggerFlag={discardTriggerFlag}
          handPlayedTriggerFlag={handPlayedTriggerFlag}
          activeFlagClearTrigger={activeFlagClearTrigger}
          sortTriggerFlagSet={sortTriggerFlagSet}
          activeFlagClearTriggerSet={activeFlagClearTriggerSet}
        />

        <pixiLayoutContainer
          layout={{
            justifyContent: 'center',
            borderWidth: 0,
            borderColor: 0xff0000
          }}
        >
          <Control
            onSortTrigger={() => sortTriggerFlagSet(true)}
            onDiscardTrigger={() => discardTriggerFlagSet(true)}
            onHandPlayedTrigger={() => handPlayedTriggerFlagSet(true)}
          />
        </pixiLayoutContainer>
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Round;
