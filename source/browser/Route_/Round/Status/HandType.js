import { useMemo, Fragment } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { BitmapText } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '#browser/component/useStore';
import handTypeDefinitionCollection from '#browser/component/definition/handType.json';
import handTypeLevelDefinitionGet from '#browser/component/utility/handTypeLevelDefinitionGet';
import Badge from '#browser/Component/Badge';

const HandType = () => {
  useExtend({ LayoutContainer, BitmapText });

  const { handTypeStatus, handTypeIndex } = useStore(
    useShallow(({ handTypeStatusCollection, round: { handTypeIndex } }) => ({
      handTypeStatus: handTypeStatusCollection[handTypeIndex],
      handTypeIndex
    }))
  );

  const handPlayedFlag = useMemo(
    () => _.isFinite(handTypeIndex),
    [handTypeIndex]
  );

  const {
    name,
    level,
    chip = 0,
    multiplier = 0
  } = useMemo(
    () =>
      (handPlayedFlag &&
        (() => {
          const { name } = handTypeDefinitionCollection[handTypeIndex];

          const { level } = handTypeStatus;

          return {
            name,
            level,
            ...handTypeLevelDefinitionGet(level, handTypeIndex)
          };
        })()) ||
      /** @type {Record<string, unknown>} */ ({}),
    [handPlayedFlag, handTypeIndex, handTypeStatus]
  );

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        padding: 10,
        borderWidth: 0,
        borderColor: 0xff0000,
        backgroundColor: 0x283235
      }}
    >
      <pixiLayoutContainer
        layout={{
          borderWidth: 0,
          borderColor: 0x00ff00
        }}
      >
        <pixiBitmapText
          text={handPlayedFlag ? `${name} lvl.${level}` : 'Hand Played'}
          layout={{ top: -6 }}
          style={{
            fontFamily: 'm6x11plus',
            fontSize: 24,
            fill: 0xffffff
          }}
          {...(!handPlayedFlag && { alpha: 0.5 })}
        />
      </pixiLayoutContainer>

      <pixiLayoutContainer
        layout={{
          width: '100%',
          justifyContent: 'center',
          borderWidth: 0,
          borderColor: 0xff0000
        }}
      >
        {[chip, multiplier].map((value, index) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <Fragment key={index}>
            <Badge
              layout={{
                flex: 1,
                ...(!index && { justifyContent: 'flex-end' }),
                padding: 10,
                paddingTop: 5,
                paddingBottom: 5,
                borderRadius: 4,
                borderWidth: 0,
                borderColor: 0xff0000,
                backgroundColor: !index ? 0x54afff : 0xff6f5b
              }}
            >
              <pixiBitmapText
                text={value}
                layout={{
                  top: -5
                }}
                style={{
                  fontFamily: 'm6x11plus',
                  fontSize: 24,
                  fill: 0xffffff
                }}
              />
            </Badge>

            {!index && (
              <pixiLayoutContainer
                layout={{
                  justifyContent: 'center',
                  padding: 10,
                  paddingTop: 5,
                  paddingBottom: 5,
                  borderWidth: 0,
                  borderColor: 0xffffff
                }}
              >
                <pixiBitmapText
                  text='X'
                  layout={{
                    left: 2,
                    top: -5
                  }}
                  style={{
                    fontFamily: 'm6x11plus',
                    fontSize: 24,
                    fill: 0xfa5546
                  }}
                />
              </pixiLayoutContainer>
            )}
          </Fragment>
        ))}
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default HandType;
