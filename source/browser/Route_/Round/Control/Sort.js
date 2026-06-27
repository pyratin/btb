import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
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
      <pixiLayoutContainer
        layout={{
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          padding: 20,
          paddingTop: 10,
          paddingBottom: 10,
          borderWidth: 0,
          borderColor: 0xff0000
        }}
      >
        <Badge
          layout={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderWidth: 2,
            borderColor: 0xffffff,
            borderRadius: 4
          }}
          alpha={0.25}
        />

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
            layout={{ top: -6 }}
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
              layout={{
                padding: 10,
                paddingTop: 2,
                paddingBottom: 2,
                borderRadius: 4,
                backgroundColor: 0xf69000
              }}
              style={{
                fontFamily: 'm6x11plus',
                fontSize: 24,
                fill: 0xffffff
              }}
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
