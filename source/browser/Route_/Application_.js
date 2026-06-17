import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiJs from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { Application, useExtend } from '@pixi/react';
import '@pixi/layout';

import useStore from '#browser/component/useStore';

const Application__ = ({ children }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        justifyContent: 'center',
        borderWidth: 10,
        borderColor: 0xffffff
      }}
    >
      {children}
    </pixiLayoutContainer>
  );
};

const Application_ = ({ children = undefined }) => {
  const { layoutDefinitionStage } = useStore(
    useShallow(({ layoutDefinition: { stage: layoutDefinitionStage } }) => ({
      layoutDefinitionStage
    }))
  );

  const [initialized, initializedSet] = useState(false);

  return (
    <Application
      resizeTo={window}
      antialias
      resolution={Math.round(window.devicePixelRatio) || 1}
      autoDensity={true}
      useBackBuffer
      backgroundColor={0x000000}
      onInit={({ stage }) => {
        Object.assign(
          stage,
          /** @type {pixiJs.ContainerOptions} */ ({
            layout: {
              ...layoutDefinitionStage,
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
