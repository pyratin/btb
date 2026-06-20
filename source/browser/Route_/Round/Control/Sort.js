import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { NineSliceSprite, BitmapText } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import _ from 'lodash';

import useStore from '#browser/component/useStore';
import Button from '#browser/Component/Button';

const nineSliceSpriteOption = [
  'leftWidth',
  'topHeight',
  'rightWidth',
  'bottomHeight'
].reduce((memo, key) => ({ ...memo, [key]: 16 }), {});

const Sort = ({ onSortTrigger }) => {
  useExtend({ LayoutContainer, NineSliceSprite, BitmapText });

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
        flexBasis: '150%',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <pixiNineSliceSprite
        texture={borderOutlineTexture}
        {...nineSliceSpriteOption}
        layout={{ position: 'absolute', width: '100%', height: '100%' }}
        tint={0xffffff}
        alpha={0.25}
      />

      <pixiLayoutContainer
        layout={{
          flexDirection: 'column',
          gap: 5,
          padding: 10,
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
          <pixiBitmapText
            text='Sort Hand'
            layout={{ top: -4 }}
            style={{ fontFamily: 'm6x11plus', fontSize: 24, fill: 0xffffff }}
            alpha={0.8}
          />
        </pixiLayoutContainer>

        <pixiLayoutContainer
          layout={{
            gap: 5,
            borderWidth: 0,
            borderColor: 0xff0000
          }}
        >
          {['rank', 'suit'].map((key, index) => (
            <Button
              key={key}
              text={_.capitalize(key)}
              fontSize={24}
              padding={{ padding: 5, paddingTop: 2, paddingBottom: 2 }}
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
