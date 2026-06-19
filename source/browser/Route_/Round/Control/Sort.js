import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { Text, Graphics } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import _ from 'lodash';

import useStore from '#browser/component/useStore';
import Button from '#browser/Component/Button';

const Sort = ({ onSortTrigger }) => {
  useExtend({ LayoutContainer, Text, Graphics });

  const { borderOutlineTexture, handPlayedFlag, handSortTypeIndexSet } =
    useStore(
      useShallow(({ bundle, round: { handPlayed }, handSortTypeIndexSet }) => ({
        borderOutlineTexture: bundle.miscellaneous.borderOutline,
        handPlayedFlag: !!handPlayed,
        handSortTypeIndexSet
      }))
    );

  const ref = useRef(undefined);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        flex: 1,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <pixiNineSliceSprite
        texture={borderOutlineTexture}
        leftWidth={16}
        topHeight={16}
        rightWidth={16}
        bottomHeight={16}
        layout={{ position: 'absolute', width: '100%', height: '100%' }}
        tint={0xffffff}
        alpha={0.25}
      />

      <pixiLayoutContainer
        layout={{
          flexDirection: 'column',
          gap: 5,
          padding: 20,
          borderWidth: 0,
          borderColor: 0x00ff00
        }}
      >
        <pixiLayoutContainer
          layout={{
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0,
            borderColor: 0x00ff00
          }}
        >
          <pixiText
            text='Sort Hand'
            layout={{}}
            style={{ fontFamily: 'm6x11plus', fontSize: 24, fill: 0xffffff }}
            alpha={0.8}
          />
        </pixiLayoutContainer>

        <pixiLayoutContainer
          layout={{
            gap: 10,
            borderWidth: 0,
            borderColor: 0xff0000
          }}
        >
          {['rank', 'suit'].map((key, index) => (
            <Button
              key={key}
              text={_.capitalize(key)}
              fontSize={24}
              padding={{ padding: 2 }}
              borderRadius={4}
              backgroundColor={0xf69000}
              disableFlag={handPlayedFlag}
              onPointerTap={() => {
                handSortTypeIndexSet(index);

                onSortTrigger(true);
              }}
            />
          ))}
        </pixiLayoutContainer>
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Sort;
