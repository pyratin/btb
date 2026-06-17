import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      /** Registered at runtime via `@pixi/react` useExtend */
      // @ts-expect-error -- missing dependencies
      pixiLayoutContainer: import('@pixi/react').PixiReactElementProps<
        typeof import('@pixi/layout/components').LayoutContainer
      > & {
        // @ts-expect-error -- missing dependencies
        layout?: Partial<import('@pixi/layout').LayoutStyles> | boolean;
        onLayout?: (layout: import('@pixi/layout').Layout) => void;
      };
      /** Registered at runtime via `@pixi/react` useExtend */
      pixiText: import('@pixi/react').PixiReactElementProps<
        typeof import('pixi.js').Text
      > &
        import('pixi.js').CanvasTextOptions;
      /** Registered at runtime via `@pixi/react` useExtend */
      pixiHTMLText: import('@pixi/react').PixiReactElementProps<
        typeof import('pixi.js').HTMLText
      > &
        import('pixi.js').HTMLTextOptions;
    }
  }
}

declare module 'pixi-filters' {
  export interface DropShadowFilterOptions {
    antialias?: boolean;
  }
}
