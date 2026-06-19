import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import Hand from './Hand';

const Round = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        marginLeft: 5,
        marginRight: 5,
        borderWidth: 0,
        borderColor: 0xffffff
      }}
    >
      <Hand />
    </pixiLayoutContainer>
  );
};

export default Round;
