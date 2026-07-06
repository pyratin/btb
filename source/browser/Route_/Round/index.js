import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore.js';
import Status from './Status';
import Hand from './Hand';
import Control from './Control';
import HandPlayed from './HandPlayed';

const Round = () => {
  useExtend({ LayoutContainer });

  const { handPlayedFlag, handSet } = useStore(
    useShallow(({ round: { handPlayed }, handSet }) => ({
      handPlayedFlag: !!handPlayed,
      handSet
    }))
  );

  const [sortTriggerFlag, sortTriggerFlagSet] = useState(false);

  const [discardTriggerFlag, discardTriggerFlagSet] = useState(false);

  const [handPlayedTriggerFlag, handPlayedTriggerFlagSet] = useState(false);

  const [activeFlagClearTrigger, activeFlagClearTriggerSet] = useState(false);

  const _activeFlagClearTriggerSet = () => {
    !handPlayedFlag &&
      (() => {
        handSet((hand) => hand.map((card) => ({ ...card, activeFlag: false })));

        activeFlagClearTriggerSet(true);
      })();
  };

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
          borderColor: 0xff0000
        }}
        eventMode='static'
        onPointerTap={_activeFlagClearTriggerSet}
      ></pixiLayoutContainer>

      <pixiLayoutContainer
        layout={{
          borderWidth: 0,
          borderColor: 0xffffff
        }}
      >
        <Status />
      </pixiLayoutContainer>

      <pixiLayoutContainer
        layout={{
          position: 'relative',
          width: '100%',
          flexDirection: 'column',
          gap: 10,
          marginTop: 'auto',
          borderWidth: 0,
          borderColor: 0xffffff
        }}
      >
        <pixiLayoutContainer
          layout={{
            borderWidth: 0,
            borderColor: 0xffffff
          }}
          onPointerTap={_activeFlagClearTriggerSet}
        >
          <HandPlayed />
        </pixiLayoutContainer>

        <Hand
          sortTriggerFlag={sortTriggerFlag}
          discardTriggerFlag={discardTriggerFlag}
          handPlayedTriggerFlag={handPlayedTriggerFlag}
          activeFlagClearTrigger={activeFlagClearTrigger}
          sortTriggerFlagSet={sortTriggerFlagSet}
          discardTriggerFlagSet={discardTriggerFlagSet}
          handPlayedTriggerFlagSet={handPlayedTriggerFlagSet}
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
