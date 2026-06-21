import { Outlet } from 'react-router';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import Application_ from './Application_';
import { BACKGROUND_PRESETS } from '#browser/component/definition/backgroundPresets';
import Background from '#browser/Component/Background';

const Route_ = () => {
  useExtend({ LayoutContainer });

  return (
    <Application_>
      <pixiLayoutContainer
        layout={{
          position: 'relative',
          flex: 1,
          borderWidth: 0,
          borderColor: 0xff0000
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
        >
          <Background {...BACKGROUND_PRESETS.DEFAULT} />
        </pixiLayoutContainer>

        <Outlet />
      </pixiLayoutContainer>
    </Application_>
  );
};

export default Route_;
