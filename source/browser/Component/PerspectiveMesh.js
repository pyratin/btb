/* eslint-disable @eslint-react/no-forward-ref */
import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo
} from 'react';
import { useExtend, useApplication } from '@pixi/react';
import {
  PerspectiveMesh as PixiPerspectiveMesh,
  Ticker,
  RenderTexture,
  Matrix,
  Texture,
  Container,
  Rectangle
} from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';

/**
 * @typedef {object} PerspectiveMeshProps
 * @property {import('react').ReactNode} children The children elements to warp
 *   in perspective.
 * @property {number} [maxTiltX] Maximum rotation around X axis (tilt up/down)
 *   in radians. Default is 0.3.
 * @property {number} [maxTiltY] Maximum rotation around Y axis (tilt
 *   left/right) in radians. Default is 0.3.
 * @property {number} [focalLength] Focal length / camera distance for
 *   perspective projection. Default is 800.
 * @property {number} [speed] Interpolation speed for smooth transition/lerping.
 *   Default is 0.08.
 * @property {boolean} [idle] Whether to play the ambient idle oscillation
 *   animation. Default is false.
 * @property {boolean} [animating] Whether the offscreen children are animating
 *   and require rendering every frame. Default is false.
 * @property {string} [dirtyKey] A key that triggers an offscreen re-render
 *   whenever it changes.
 * @property {boolean} [disableFlag] Whether to disable the 3D perspective warp and tilt effect.
 */

/**
 * PerspectiveMesh Component
 *
 * Wraps arbitrary child PixiJS elements, captures them offscreen into a dynamic
 * RenderTexture, and projects that texture in 3D perspective space towards the
 * user's cursor (Balatro-like card tilt effect).
 */
const PerspectiveMesh = forwardRef(
  /**
   * @param {PerspectiveMeshProps & Record<string, unknown>} props The component
   *   properties.
   * @param {import('react').ForwardedRef<
   *   import('pixi.js').PerspectiveMesh
   * >} ref
   *   The forwarded reference to the underlying PixiJS PerspectiveMesh.
   * @returns {import('react').ReactElement} The rendered React element.
   */
  (
    {
      children,
      maxTiltX = 0.3,
      maxTiltY = 0.3,
      focalLength = 800,
      speed = 0.08,
      idle = false,
      layout,
      cursor = undefined,
      animating = false,
      dirtyKey = undefined,
      disableFlag = false,
      ...rest
    },
    ref
  ) => {
    useExtend({
      PerspectiveMesh: PixiPerspectiveMesh,
      Container,
      LayoutContainer
    });

    const {
      app: { renderer }
    } = useApplication();

    /**
     * @type {import('react').MutableRefObject<
     *   import('pixi.js').Container | null
     * >}
     */
    const sourceContainerRef = useRef(null);

    /**
     * @type {import('react').MutableRefObject<
     *   import('pixi.js').PerspectiveMesh | null
     * >}
     */
    const meshRef = useRef(null);

    /**
     * @type {import('react').MutableRefObject<
     *   import('@pixi/layout/components').LayoutContainer | null
     * >}
     */
    const wrapperRef = useRef(null);

    useImperativeHandle(ref, () => meshRef.current);

    const phaseOffset = useMemo(() => Math.random() * 100, []);

    useEffect(() => {
      const sourceContainer = sourceContainerRef.current;
      const mesh = meshRef.current;
      const wrapper = wrapperRef.current;

      return (!sourceContainer || !mesh || !renderer || !wrapper)
        ? undefined
        : (() => {
            mesh.hitArea = new Rectangle(0, 0, 0, 0);
            mesh.eventMode = 'none';
            mesh.interactive = false;

            /** @type {import('pixi.js').RenderTexture | null} */
            let rt = null;

            let targetThetaX = 0;
            let targetThetaY = 0;
            let currentThetaX = 0;
            let currentThetaY = 0;
            let pivotSetFlag = false;
            let hoverFlag = false;
            let elapsedSeconds = 0;
            let renderNeedsFlag = true;

            let boundsCached = null;
            let widthCached = 0;
            let heightCached = 0;

            const pointerMoveHandle = (e) => {
              hoverFlag = true;
              (rt?.width || 0) !== 0 &&
                (rt?.height || 0) !== 0 &&
                (() => {
                  const localPos = e.getLocalPosition(wrapper);
                  targetThetaY = -Math.max(-1, Math.min(1, (localPos.x - rt.width / 2) / (rt.width / 2))) * maxTiltY;
                  targetThetaX = Math.max(-1, Math.min(1, (localPos.y - rt.height / 2) / (rt.height / 2))) * maxTiltX;
                })();
            };

            const pointerOutHandle = () => {
              hoverFlag = false;
            };

            wrapper.interactive = true;
            wrapper.on('pointermove', pointerMoveHandle);
            wrapper.on('pointerout', pointerOutHandle);
            wrapper.on('pointerleave', pointerOutHandle);

            const tickerHandle = () => {
              const bounds = boundsCached || sourceContainer.getLocalBounds();
              const w = widthCached || Math.ceil(bounds.width);
              const h = heightCached || Math.ceil(bounds.height);

              (!boundsCached || widthCached === 0 || heightCached === 0) &&
                w > 0 &&
                h > 0 &&
                (() => {
                  boundsCached = bounds;
                  widthCached = w;
                  heightCached = h;
                })();

              w > 0 && h > 0 &&
                (() => {
                  elapsedSeconds += Ticker.shared.deltaTime / 60;

                  const targetTheta = disableFlag
                    ? [0, 0]
                    : hoverFlag
                      ? [targetThetaX, targetThetaY]
                      : idle
                        ? [
                            Math.sin(elapsedSeconds * 1.8 + phaseOffset) * maxTiltX * 0.6,
                            Math.cos(elapsedSeconds * 1.5 + phaseOffset * 1.3) * maxTiltY * 0.6
                          ]
                        : [0, 0];
                  targetThetaX = targetTheta[0];
                  targetThetaY = targetTheta[1];

                  wrapper &&
                    (() => {
                      wrapper.layout &&
                        (() => {
                          const styleCurrent = wrapper.layout.style;
                          (styleCurrent.width !== w || styleCurrent.height !== h) &&
                            wrapper.layout.setStyle({
                              ...styleCurrent,
                              width: w,
                              height: h
                            });
                        })();

                      const hitArea = /** @type {import('pixi.js').Rectangle | null} */ (wrapper.hitArea);
                      (!hitArea || hitArea.width !== w || hitArea.height !== h) &&
                        (wrapper.hitArea = new Rectangle(0, 0, w, h));
                    })();

                  !rt
                    ? (() => {
                        rt = RenderTexture.create({
                          width: w,
                          height: h,
                          resolution: renderer.resolution || window.devicePixelRatio || 1,
                          antialias: true
                        });
                        mesh.texture = rt;
                        renderNeedsFlag = true;
                      })()
                    : rt.width !== w || rt.height !== h
                      ? (() => {
                          rt.destroy(true);
                          rt = RenderTexture.create({
                            width: w,
                            height: h,
                            resolution: renderer.resolution || window.devicePixelRatio || 1,
                            antialias: true
                          });
                          mesh.texture = rt;
                          renderNeedsFlag = true;
                        })()
                      : (() => {})();

                  animating || renderNeedsFlag
                    ? (() => {
                        const visiblePrevFlag = sourceContainer.visible;
                        sourceContainer.visible = true;

                        const systems = /** @type {import('pixi.js').Renderer & { systems: Record<string, { update: (container: import('pixi.js').Container) => void }> }} */ (renderer).systems;
                        systems && systems.layout && systems.layout.update(sourceContainer);

                        sourceContainer.updateLocalTransform();

                        renderer.render({
                          container: sourceContainer,
                          target: rt,
                          transform: new Matrix().translate(-bounds.x, -bounds.y),
                          clear: true
                        });

                        sourceContainer.visible = visiblePrevFlag;
                        renderNeedsFlag = false;
                      })()
                    : (() => {})();

                  mesh.position.set(w / 2, h / 2);
                  (!pivotSetFlag || mesh.pivot.x !== w / 2 || mesh.pivot.y !== h / 2) &&
                    (() => {
                      mesh.pivot.set(w / 2, h / 2);
                      pivotSetFlag = true;
                    })();

                  currentThetaX += (targetThetaX - currentThetaX) * speed;
                  currentThetaY += (targetThetaY - currentThetaY) * speed;

                  const uCollection = [-w / 2, w / 2, w / 2, -w / 2];
                  const vCollection = [-h / 2, -h / 2, h / 2, h / 2];

                  const cosX = Math.cos(currentThetaX);
                  const sinX = Math.sin(currentThetaX);
                  const cosY = Math.cos(currentThetaY);
                  const sinY = Math.sin(currentThetaY);

                  const projectedCornerCollection = [0, 1, 2, 3].flatMap((index) => {
                    const scale = focalLength / (focalLength - (vCollection[index] * sinX - uCollection[index] * sinY * cosX));
                    return [
                      (uCollection[index] * cosY) * scale + w / 2,
                      (vCollection[index] * cosX + uCollection[index] * sinX * sinY) * scale + h / 2
                    ];
                  });

                  mesh.setCorners(
                    projectedCornerCollection[0],
                    projectedCornerCollection[1],
                    projectedCornerCollection[2],
                    projectedCornerCollection[3],
                    projectedCornerCollection[4],
                    projectedCornerCollection[5],
                    projectedCornerCollection[6],
                    projectedCornerCollection[7]
                  );
                })();
            };

            Ticker.shared.add(tickerHandle);

            return () => {
              wrapper.off('pointermove', pointerMoveHandle);
              wrapper.off('pointerout', pointerOutHandle);
              wrapper.off('pointerleave', pointerOutHandle);
              Ticker.shared.remove(tickerHandle);
              rt &&
                (() => {
                  mesh.texture = Texture.WHITE;
                  rt.destroy(true);
                })();
            };
          })();
    }, [
      renderer,
      maxTiltX,
      maxTiltY,
      focalLength,
      speed,
      idle,
      phaseOffset,
      animating,
      dirtyKey,
      disableFlag
    ]);

    return (
      <>
        {/* Hidden offscreen source container holding all active children */}
        <pixiContainer ref={sourceContainerRef} visible={false}>
          {children}
        </pixiContainer>

        {/* Outer layout container holding the stationary bounding box */}
        <pixiLayoutContainer ref={wrapperRef} layout={layout} cursor={/** @type {import('pixi.js').Cursor} */ (cursor)} {...rest}>
          {/* Visible perspective-skewed mesh rendered using the RenderTexture */}
          <pixiPerspectiveMesh ref={meshRef} texture={Texture.WHITE} />
        </pixiLayoutContainer>
      </>
    );
  }
);

PerspectiveMesh.displayName = 'PerspectiveMesh';

export default PerspectiveMesh;
