import { Outlet } from 'react-router';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import Application_ from './Application_';

const Route_ = () => {
  useExtend({ LayoutContainer });

  return (
    <Application_>
      <pixiLayoutContainer
        layout={{
          flex: 1,
          borderWidth: 0,
          borderColor: 0xff0000
        }}
      >
        <Outlet />
      </pixiLayoutContainer>
    </Application_>
  );
};

export default Route_;
