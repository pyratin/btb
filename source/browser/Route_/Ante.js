import { useShallow } from 'zustand/react/shallow';
import { Texture, Sprite, BitmapText, NineSliceSprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '../component/useStore';
import blindTypeDefinitionCollection from '#browser/component/definition/blindType.json';
import Badge from '#browser/Component/Badge';

const borderHeight = 2;

const Ante = () => {
  useExtend({ LayoutContainer, Sprite, BitmapText, NineSliceSprite });

  const { roundIndex } = useStore(
    useShallow(({ round: { index } }) => ({
      roundIndex: index
    }))
  );

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        borderWidth: 0,
        borderColor: 0x000000
      }}
    >
      {blindTypeDefinitionCollection.map(
        ({ name, backgroundColor, borderColor }, index) => {
          const _index = roundIndex % blindTypeDefinitionCollection.length;

          const activeFlag = _index === index;

          return (
            <pixiLayoutContainer
              key={name}
              layout={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 0,
                borderColor: 0x000000
              }}
              eventMode='none'
              {...(activeFlag
                ? { alpha: 1, eventMode: 'passive' }
                : { alpha: 0.7, eventMode: 'none' })}
            >
              <pixiLayoutContainer
                layout={{
                  position: 'relative',
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 20,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderWidth: 0,
                  borderColor: 0xff0000
                }}
              >
                <pixiSprite
                  texture={Texture.WHITE}
                  layout={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  tint={0x3a494f}
                />

                <pixiSprite
                  texture={Texture.WHITE}
                  layout={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: borderHeight
                  }}
                  tint={borderColor}
                />

                <pixiSprite
                  texture={Texture.WHITE}
                  layout={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: borderHeight
                  }}
                  tint={borderColor}
                />

                <Badge
                  borderRadius={16}
                  backgroundColor={backgroundColor}
                  borderColor={borderColor}
                  layout={{
                    position: 'relative',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    paddingTop: 10,
                    paddingBottom: 10
                  }}
                >
                  <pixiBitmapText
                    text={name}
                    layout={{ top: -4 }}
                    style={{
                      fontFamily: 'm6x11plus',
                      fontSize: 24,
                      fill: 0xffffff
                    }}
                  />
                </Badge>
              </pixiLayoutContainer>
            </pixiLayoutContainer>
          );
        }
      )}
    </pixiLayoutContainer>
  );
};

export default Ante;
