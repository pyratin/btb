import { useRef, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiJs from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { gsap } from 'gsap';
import { PixiPlugin as gsapPixiPlugin } from 'gsap/PixiPlugin';
import { useGSAP } from '@gsap/react';

import useStore from '#browser/component/useStore';
import Card from '#browser/Component/Card';

gsap.registerPlugin(gsapPixiPlugin, useGSAP);
gsapPixiPlugin.registerPIXI(pixiJs);

const cardTransformGet = (index, hand, cardDimension, containerElement) => {
  const { layout: { _computedLayout: { width: _width = 0 } = {} } = {} } =
    containerElement;

  const cardWidthFactor = 0.75;

  const width = Math.min(
    ...[_width / hand.length, cardDimension.width * cardWidthFactor].map(
      (cardWidth) => cardWidth * hand.length
    )
  );

  const cardWidth = width / hand.length;

  const _offset = Math.abs(_width - width) / 2;

  const __offset = _offset
    ? ((1 - cardWidthFactor) * cardDimension.width) / 2
    : 0;

  const offset = _offset - __offset;

  const _index = index - (hand.length - 1) / 2;

  const angle = _index * 2;

  const angleRad = (angle * Math.PI) / 180;

  const swingX = cardDimension.height * Math.sin(angleRad);

  return {
    x: offset + cardWidth * index + cardDimension.width / 2 - swingX * 0.8,
    y:
      Math.abs(_index * 4) +
      (() => {
        const { activeFlag } = hand[index];

        return activeFlag ? -30 : 0;
      })() +
      cardDimension.height,
    angle
  };
};

const onCardCollectionAnimationCompleteHandle = (
  index,
  collection,
  onComplete
) => index === collection.length - 1 && onComplete();

const activeAnimationHandle = (
  collection,
  hand,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  collection.map((card, index) => {
    const element = containerElement.getChildByLabel(card.id);

    gsapTimeline.to(
      element,
      {
        pixi: {
          ...cardTransformGet(index, hand, cardDimension, containerElement)
        },
        duration: 0.1,
        ease: 'back.out(1.5)',
        onComplete: () =>
          onCardCollectionAnimationCompleteHandle(index, collection, onComplete)
      },
      0
    );
  });
};

const Hand = () => {
  useExtend({ LayoutContainer, Container, Sprite });

  const {
    cardShadowTexture,
    cardDimension,
    discardCardCountMaximun,
    hand: _hand,
    handSet: _handSet
  } = useStore(
    useShallow(
      ({
        bundle,
        cardDimension,
        discardCardCountMaximun,
        round: { hand },
        handSet
      }) => ({
        cardShadowTexture: bundle.miscellaneous.cardShadow,
        cardDimension,
        discardCardCountMaximun,
        hand,
        handSet
      })
    )
  );

  const ref = useRef(undefined);

  const handPreviousRef = useRef(undefined);

  const [hand, handSet] = useState(_hand);

  const [activeTriggerFlag, activeTriggerFlagSet] = useState(false);

  useEffect(() => {
    const __handSet = () =>
      // eslint-disable-next-line @eslint-react/set-state-in-effect
      handSet((hand) => {
        Object.assign(handPreviousRef, { current: hand });

        return _hand;
      });

    switch (true) {
      case activeTriggerFlag:
        return __handSet();
    }
  }, [activeTriggerFlag, _hand]);

  useGSAP(
    () => {
      activeTriggerFlag &&
        (() => {
          activeTriggerFlagSet(false);

          return activeAnimationHandle(
            handPreviousRef.current,
            hand,
            cardDimension,
            ref.current,
            () => {}
          );
        })();
    },
    { dependencies: [hand] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        // eslint-disable-next-line @eslint-react/unsupported-syntax
        ...(() => {
          const { height } = cardDimension;

          return { height: height + 20 };
        })(),
        marginTop: 'auto',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
      onLayout={(event) => {
        const eventTarget = event.target;

        eventTarget.children
          .find(({ children }) => children.length)
          .children.map((container, index) => {
            Object.assign(
              container,
              cardTransformGet(index, hand, cardDimension, eventTarget)
            );
          });
      }}
    >
      {hand.map((card, index, collection) => {
        // eslint-disable-next-line @eslint-react/unsupported-syntax
        const activeFlagSetEnabled = (() =>
          collection
            .filter(({ id }) => id !== card.id)
            .filter(({ activeFlag }) => activeFlag).length <
          discardCardCountMaximun)();

        return (
          <pixiContainer
            key={card.id}
            label={card.id}
            pivot={{ x: cardDimension.width / 2, y: cardDimension.height }}
            eventMode='static'
            cursor='pointer'
            onPointerTap={() => {
              switch (true) {
                case activeFlagSetEnabled:
                  // eslint-disable-next-line @eslint-react/unsupported-syntax
                  return (() => {
                    _handSet([
                      ...hand.slice(0, index),
                      {
                        ...card,
                        activeFlag: !card.activeFlag
                      },
                      ...hand.slice(index + 1)
                    ]);

                    activeTriggerFlagSet(true);
                  })();
              }
            }}
          >
            <pixiSprite
              texture={cardShadowTexture}
              position={{ x: -10, y: -10 }}
              alpha={1}
            />

            <Card card={card} />
          </pixiContainer>
        );
      })}
    </pixiLayoutContainer>
  );
};

export default Hand;
