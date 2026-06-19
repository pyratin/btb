import { useMemo, useState, useEffect } from 'react';
import * as pixiJs from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { Application, useExtend, useApplication } from '@pixi/react';
import '@pixi/layout';

import CRT from '#browser/component/shader/CRT';

const windowInnerDimenesionGet = () => {
  const {
    visualViewport: { width = 0, height = 0 }
  } = window;

  return { width, height };
};

const Application__ = ({ children }) => {
  useExtend({ LayoutContainer });

  const {
    app: { renderer, stage }
  } = useApplication();

  const filters = useMemo(() => [new CRT()], []);

  useEffect(() => {
    const onRendererResizeHandle = () =>
      Object.assign(
        stage,
        /** @type {pixiJs.ContainerOptions} */ ({
          layout: windowInnerDimenesionGet()
        })
      );

    renderer.on('resize', onRendererResizeHandle);

    return () => {
      renderer.off('resize', onRendererResizeHandle);
    };
  }, [renderer, stage]);

  useEffect(() => {
    return () => {
      filters.map((filter) => filter.destroy());
    };
  }, [filters]);

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        justifyContent: 'center',
        borderWidth: 0,
        borderColor: 0xffffff
      }}
      filters={filters}
    >
      {children}
    </pixiLayoutContainer>
  );
};

const Application_ = ({ children = undefined }) => {
  const [initialized, initializedSet] = useState(false);

  return (
    <Application
      resizeTo={window}
      antialias
      resolution={Math.round(window.devicePixelRatio) || 1}
      autoDensity={true}
      useBackBuffer
      backgroundColor={0xaaaaaa}
      onInit={({ stage }) => {
        Object.assign(
          stage,
          /** @type {pixiJs.ContainerOptions} */ ({
            layout: {
              ...windowInnerDimenesionGet(),
              alignItems: 'stretch'
            }
          })
        );

        initializedSet(true);
      }}
    >
      {initialized && <Application__>{children}</Application__>}
    </Application>
  );
};

export default Application_;
