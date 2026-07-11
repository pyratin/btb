import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiJs from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import gsap from 'gsap';
import gsapPixiPlugin from 'gsap/PixiPlugin';
import { useGSAP } from '@gsap/react';

import useStore from '#browser/component/useStore';
import Card from '#browser/Component/Card';

gsap.registerPlugin(gsapPixiPlugin, useGSAP);
gsapPixiPlugin.registerPIXI(pixiJs);

const containerElementWidthGet = (containerElement) => {
  const { layout: { _computedLayout: { width = 0 } = {} } = {} } =
    containerElement;

  return width;
};

const cardIdActiveGet = (cardIdActive, HandPlayed) => {
  const handPlayedScoringIdCollection = HandPlayed.filter(
    ({ scoringFlag }) => scoringFlag
  ).map(({ id }) => id);

  const index = handPlayedScoringIdCollection.findIndex(
    (id) => id === cardIdActive
  );

  return handPlayedScoringIdCollection[
    index !== handPlayedScoringIdCollection.length - 1 ? index + 1 : -1
  ];
};

const cardTransformGet = (index, hand, cardDimension, containerElement) => {
  const _width = containerElementWidthGet(containerElement);

  const cardWidthFactor = 1.1;

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

  const { scoringFlag } = hand[index];

  return {
    x: offset + cardWidth * index + cardDimension.width / 2,
    y: 0 + scoringFlag ? -40 : 0
  };
};

const onCardCollectionAnimationCompleteHandle = (
  index,
  collection,
  onComplete
) => index === collection.length - 1 && onComplete();

const entryAnimationHandle = (
  collection,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  collection?.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    const cardTransform = cardTransformGet(
      index,
      collection,
      cardDimension,
      containerElement
    );

    gsapTimeline.fromTo(
      element,
      {
        pixi: {
          ...cardTransform,
          y: (() => {
            const { height } = cardDimension;

            return height;
          })()
        }
      },
      {
        pixi: { ...cardTransform, y: 0 },
        duration: 0.4,
        ease: 'back.out(1.4)',
        onComplete: () =>
          onCardCollectionAnimationCompleteHandle(index, collection, onComplete)
      },
      index * 0.08
    );
  });
};

const scoringAnimationHandle = (
  collection,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  collection?.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    const cardTransform = cardTransformGet(
      index,
      collection,
      cardDimension,
      containerElement
    );

    const option = /** @type {gsap.TweenVars} */ ({
      duration: 0.4,
      ease: 'back.out(1.4)'
    });

    const timelinePosition = index * 0.08;

    gsapTimeline.to(
      element,
      {
        pixi: cardTransform,
        ...option,
        onComplete: () =>
          onCardCollectionAnimationCompleteHandle(index, collection, onComplete)
      },
      timelinePosition
    );

    const cardShadowElement = element.children[0].getChildByLabel('shadow');

    card.scoringFlag &&
      gsapTimeline.to(
        cardShadowElement,
        {
          y: 20,
          ...option
        },
        timelinePosition
      );
  });
};

const HandPlayed = () => {
  useExtend({ LayoutContainer, Container, Sprite });

  const { cardDimension, handPlayed, cardIdActiveSet } = useStore(
    useShallow(({ cardDimension, round: { handPlayed }, cardIdActiveSet }) => ({
      cardDimension,
      handPlayed,
      cardIdActiveSet
    }))
  );

  const ref = useRef(undefined);

  const [layoutInitializedFlag, layoutInitializedFlagSet] = useState(false);

  const [scoringAnimationTriggerFlag, scoringAnimationTriggerFlagSet] =
    useState(false);

  useGSAP(
    () => {
      layoutInitializedFlag &&
        handPlayed &&
        (() => {
          entryAnimationHandle(handPlayed, cardDimension, ref.current, () => {
            scoringAnimationTriggerFlagSet(true);
          });
        })();
    },
    { dependencies: [layoutInitializedFlag, handPlayed] }
  );

  useGSAP(
    () => {
      scoringAnimationTriggerFlag &&
        scoringAnimationHandle(handPlayed, cardDimension, ref.current, () => {
          cardIdActiveSet(cardIdActiveGet(undefined, handPlayed));
        });
    },
    { dependencies: [scoringAnimationTriggerFlag, handPlayed] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        width: '100%',
        // eslint-disable-next-line @eslint-react/unsupported-syntax
        height: (() => {
          const { height } = cardDimension;

          return height;
        })(),
        justifyContent: 'center',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
      sortableChildren={true}
      eventMode='none'
      onLayout={(event) => {
        layoutInitializedFlagSet(true);

        const eventTarget = event.target;

        eventTarget.children
          .find(({ children }) => children.length)
          ?.children.map((container, index) =>
            Object.assign(
              container,
              cardTransformGet(index, handPlayed, cardDimension, eventTarget)
            )
          );
      }}
    >
      {handPlayed?.map((card, index) => {
        return (
          <pixiContainer
            key={card.id}
            label={card.id}
            pivot={{ x: cardDimension.width / 2, y: 0 }}
            zIndex={index}
          >
            <Card
              perspectiveMeshDisableFlag={true}
              shadowConfiguration={{
                tint: 0x000000,
                alpha: 0.25
              }}
              card={card}
            />
          </pixiContainer>
        );
      })}
    </pixiLayoutContainer>
  );
};

export default HandPlayed;
