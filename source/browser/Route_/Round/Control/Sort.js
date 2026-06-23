import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { NineSliceSprite, BitmapText } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import _ from 'lodash';

import useStore from '#browser/component/useStore';
import Badge from '#browser/Component/Badge';
import Button from '#browser/Component/Button';

const Sort = ({ onSortTrigger }) => {
  useExtend({ LayoutContainer, NineSliceSprite, BitmapText });

  const { handPlayedFlag, handSortTypeIndexSet } = useStore(
    useShallow(({ round: { handPlayed }, handSortTypeIndexSet }) => ({
      handPlayedFlag: !!handPlayed,
      handSortTypeIndexSet
    }))
  );

  const ref = useRef(undefined);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <Badge
        borderRadius={8}
        backgroundColor='#000000ff'
        borderColor='#ffffffaa'
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
              padding={{ padding: 10, paddingTop: 5, paddingBottom: 5 }}
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
      </Badge>
    </pixiLayoutContainer>
  );
};

export default Sort;
