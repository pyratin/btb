import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import * as pixiJs from 'pixi.js';
import { Texture, Sprite, BitmapText, NineSliceSprite } from 'pixi.js';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

import useStore from '../component/useStore';
import blindTypeDefinitionCollection from '#browser/component/definition/blindType.json';
import roundScoreTargetGet from '#browser/component/utility/roundScoreTargetGet';
import Badge from '#browser/Component/Badge';
import Button from '#browser/Component/Button';

const borderHeight = 2;

const Ante = () => {
  useExtend({ LayoutContainer, Sprite, BitmapText, NineSliceSprite });

  const { tokenTexture, roundIndex, redirectSet } = useStore(
    useShallow(({ bundle, round: { index }, redirectSet }) => ({
      tokenTexture: bundle.stickers['sticker-1'],
      roundIndex: index,
      redirectSet
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
                  padding: 5,
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
                    borderWidth: 0,
                    borderColor: 0xff0000
                  }}
                >
                  <Badge
                    layout={
                      /** @type {pixiLayout.LayoutOptions} */ ({
                        padding: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                        borderWidth: 2,
                        borderColor,
                        borderRadius: 4,
                        backgroundColor
                      })
                    }
                  >
                    <pixiBitmapText
                      text={`${_.startCase(name)} Blind`}
                      layout={{ top: -4 }}
                      style={{
                        fontFamily: 'm6x11plus',
                        fontSize: 24,
                        fill: 0xffffff
                      }}
                    />
                  </Badge>
                </pixiLayoutContainer>

                <pixiLayoutContainer
                  layout={{
                    borderWidth: 0,
                    borderColor: 0x00ff00
                  }}
                >
                  <Badge
                    layout={
                      /** @type {pixiLayout.LayoutOptions} */ ({
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 5,
                        padding: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                        borderRadius: 4,
                        backgroundColor: 0x313e41
                      })
                    }
                  >
                    <pixiBitmapText
                      text='Score at least'
                      layout={{}}
                      style={{
                        fontFamily: 'm6x11plus',
                        fontSize: 24,
                        fill: 0xffffff
                      }}
                    />

                    <pixiLayoutContainer
                      layout={{
                        alignItems: 'center',
                        gap: 10,
                        borderWidth: 0,
                        borderColor: 0xff0000
                      }}
                    >
                      <pixiSprite texture={tokenTexture} layout={{}} />

                      <pixiBitmapText
                        text={roundScoreTargetGet(
                          Math.floor(
                            roundIndex / blindTypeDefinitionCollection.length
                          ) *
                            blindTypeDefinitionCollection.length +
                            index
                        )}
                        layout={{
                          top: -6
                        }}
                        style={{
                          fontFamily: 'm6x11plus',
                          fontSize: 32,
                          fill: 0xfa5546
                        }}
                      />
                    </pixiLayoutContainer>
                  </Badge>
                </pixiLayoutContainer>

                <pixiLayoutContainer
                  layout={{ borderWidth: 0, borderColor: 0x0000ff }}
                >
                  <Button
                    text='Select'
                    layout={
                      /** @type {pixiLayout.LayoutOptions} */ {
                        padding: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                        borderRadius: 4,
                        backgroundColor: 0xf69000
                      }
                    }
                    style={
                      /** @type {pixiJs.TextStyleOptions} */ ({
                        fontFamily: 'm6x11plus',
                        fontSize: 24,
                        fill: 0xffffff
                      })
                    }
                    onPointerTap={() => redirectSet({ pathname: '/Round' })}
                  />
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
