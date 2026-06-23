import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { Texture, Sprite, BitmapText, NineSliceSprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '../component/useStore';
import blindTypeDefinitionCollection from '#browser/component/definition/blindType.json';

const borderHeight = 2;

const nineSliceSpriteOption = [
  'leftWidth',
  'topHeight',
  'rightWidth',
  'bottomHeight'
].reduce((memo, key) => ({ ...memo, [key]: 8 }), {});

const Ante = () => {
  useExtend({ LayoutContainer, Sprite, BitmapText, NineSliceSprite });

  const { borderOutlineTexture, roundIndex } = useStore(
    useShallow(({ bundle, round: { index } }) => ({
      borderOutlineTexture: bundle.miscellaneous.borderOutline,
      roundIndex: index,
      texture: bundle.stickers['sticker-1']
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

                <pixiLayoutContainer
                  layout={{
                    position: 'relative',
                    flexBasis: 150,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <pixiNineSliceSprite
                    texture={borderOutlineTexture}
                    {...nineSliceSpriteOption}
                    layout={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%'
                    }}
                    tint={borderColor}
                  />

                  <pixiLayoutContainer
                    layout={{
                      position: 'relative',
                      padding: 20,
                      paddingTop: 10,
                      paddingBottom: 10
                    }}
                  >
                    <pixiBitmapText
                      text={`${_.startCase(name)} Blind`}
                      layout={{ top: -6 }}
                      style={{
                        fontFamily: 'm6x11plus',
                        fontSize: 32,
                        fill: 0xffffff
                      }}
                    />
                  </pixiLayoutContainer>
                </pixiLayoutContainer>
              </pixiLayoutContainer>
            </pixiLayoutContainer>
          );
        }
      )}
    </pixiLayoutContainer>
  );
};

export default Ante;
