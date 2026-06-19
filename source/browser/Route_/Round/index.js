import { useState } from 'react';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import Hand from './Hand';
import Control from './Control';

const Round = () => {
  useExtend({ LayoutContainer });

  const [sortTriggerFlag, sortTriggerFlagSet] = useState(false);

  const [handPlayedTriggerFlag, handPlayedTriggerFlagSet] = useState(false);

  const [discardTriggerFlag, discardTriggerFlagSet] = useState(false);

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        borderWidth: 0,
        borderColor: 0xffffff
      }}
    >
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
          handPlayedTriggerFlag={handPlayedTriggerFlag}
          discardTriggerFlag={discardTriggerFlag}
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
            onHandPlayedTrigger={() => handPlayedTriggerFlagSet(true)}
            onDiscardTrigger={() => discardTriggerFlagSet(true)}
          />
        </pixiLayoutContainer>
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Round;
