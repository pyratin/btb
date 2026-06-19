import { useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { Text, Graphics } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { DropShadowFilter } from 'pixi-filters';
import _ from 'lodash';

import useStore from '#browser/component/useStore';
import Button from '#browser/Component/Button';

const borderStyle = { borderWidth: 2, borderRadius: 8 };

const filters = [
  new DropShadowFilter({
    shadowOnly: true,
    offset: { x: 0, y: 2 },
    blur: 0,
    alpha: 0.25,
    antialias: true
  })
];

const Sort = ({ onSortTrigger }) => {
  useExtend({ LayoutContainer, Text, Graphics });

  const { handPlayedFlag, handSortTypeIndexSet } = useStore(
    useShallow(({ round: { handPlayed }, handSortTypeIndexSet }) => ({
      handPlayedFlag: !!handPlayed,
      handSortTypeIndexSet
    }))
  );

  const ref = useRef(undefined);

  useEffect(() => {
    const refCurrent = /** @type {LayoutContainer} */ (ref.current);

    const refCurrentGraphics = /** @type {Graphics} */ (
      refCurrent.getChildByLabel('graphics-container').getChildAt(0)
    );

    const { layout: { _computedLayout: { width = 0, height = 0 } = {} } = {} } =
      refCurrent;

    refCurrentGraphics
      .roundRect(0, 0, width, height, borderStyle.borderRadius)
      .stroke({ width: borderStyle.borderWidth });
  }, []);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: 10,
        ...borderStyle,
        borderColor: '#ffffff44'
      }}
    >
      <pixiLayoutContainer
        label='graphics-container'
        layout={{ position: 'absolute' }}
      >
        <pixiGraphics draw={() => {}} layout={{}} filters={filters} />
      </pixiLayoutContainer>

      <pixiLayoutContainer layout={{}}>
        <pixiText
          text='Sort Hand'
          layout={{}}
          style={{ fontFamily: 'm6x11plus', fontSize: 28, fill: 0xffffff }}
          alpha={0.8}
        />
      </pixiLayoutContainer>

      <pixiLayoutContainer
        layout={{ width: '100%', justifyContent: 'center', gap: 10 }}
      >
        {['rank', 'suit'].map((key, index) => (
          <Button
            key={key}
            text={_.capitalize(key)}
            fontSize={24}
            padding={{ padding: 5 }}
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
  );
};

export default Sort;
