import { useMemo, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiJs from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { Application, useExtend, useApplication } from '@pixi/react';
import '@pixi/layout';

import useStore from '#browser/component/useStore';
import CRT from '#browser/component/shader/CRT';

const Application__ = ({ children }) => {
  useExtend({ LayoutContainer });

  const { windowInnerDimenesion } = useStore(
    useShallow(({ windowInnerDimenesion }) => ({ windowInnerDimenesion }))
  );

  const {
    app: { renderer, stage }
  } = useApplication();

  const filters = useMemo(() => [new CRT()], []);

  useEffect(() => {
    const onRendererResizeHandle = () =>
      Object.assign(
        stage,
        /** @type {pixiJs.ContainerOptions} */ ({
          layout: windowInnerDimenesion
        })
      );

    renderer.on('resize', onRendererResizeHandle);

    return () => {
      renderer.off('resize', onRendererResizeHandle);
    };
  }, [renderer, stage, windowInnerDimenesion]);

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

  const { windowInnerDimenesion } = useStore(
    useShallow(({ windowInnerDimenesion }) => ({ windowInnerDimenesion }))
  );

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
              ...windowInnerDimenesion,
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
