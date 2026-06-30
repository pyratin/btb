import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import Hand from './Hand';
import Round from './Round';

const Status = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <pixiLayoutContainer layout={{ borderWidth: 0, borderColor: 0x0000ff }}>
        <Round />
      </pixiLayoutContainer>

      <pixiLayoutContainer layout={{ borderWidth: 0, borderColor: 0x00ff00 }}>
        <Hand />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Status;
