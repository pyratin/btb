import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import Hand from './Hand';

const Round = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        overflow: 'hidden',
        flex: 1,
        flexDirection: 'column',
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 0,
        borderColor: 0xffffff
      }}
    >
      <Hand />
    </pixiLayoutContainer>
  );
};

export default Round;
