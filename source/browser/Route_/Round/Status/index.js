import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import HandType from './HandType';

const Status = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <HandType />
    </pixiLayoutContainer>
  );
};

export default Status;
