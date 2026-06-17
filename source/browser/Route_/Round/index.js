import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

const Round = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        borderWidth: 0,
        borderColor: 0xffffff
      }}
    ></pixiLayoutContainer>
  );
};

export default Round;
