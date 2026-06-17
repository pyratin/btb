import { createRoot } from 'react-dom/client';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { Application, useExtend } from '@pixi/react';

import '#browser/index.scss';

const windowInnerDimensionGet = () => {
  const {
    visualViewport: { width, height }
  } = window;

  return { width, height };
};

const Application_ = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        ...windowInnerDimensionGet(),
        borderWidth: 10,
        borderColor: 0xff0000
      }}
    ></pixiLayoutContainer>
  );
};

createRoot(document.body).render(
  <Application resizeTo={window}>
    <Application_ />
  </Application>
);
