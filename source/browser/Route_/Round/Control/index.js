import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import HandPlayedTrigger from './HandPlayedTrigger';
import Sort from './Sort';
import DiscardTrigger from './DiscardTrigger';

const Control = ({ onSortTrigger, onHandPlayedTrigger, onDiscardTrigger }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        width: '100%',
        maxWidth: 600,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <HandPlayedTrigger onHandPlayedTrigger={onHandPlayedTrigger} />

      <Sort onSortTrigger={onSortTrigger} />

      <DiscardTrigger onDiscardTrigger={onDiscardTrigger} />
    </pixiLayoutContainer>
  );
};

export default Control;
