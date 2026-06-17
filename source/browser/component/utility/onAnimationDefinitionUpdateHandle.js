export default (target, { layout: toLayout = {}, ...toRest } = {}, element) => {
  element &&
    (() => {
      element.layout.setStyle(
        Object.keys(toLayout).reduce(
          (memo, key) => ({
            ...memo,
            [key]: target[key]
          }),
          {}
        )
      );

      Object.assign(
        element,
        Object.keys(toRest).reduce(
          (memo, _key) => {
            const [key, value] = (() => {
              switch (_key) {
                case 'skewX':
                  return [
                    'skew',
                    { y: memo.skew?.y ?? element.skew.y, x: target[_key] }
                  ];

                case 'skewY':
                  return [
                    'skew',
                    { x: memo.skew?.x ?? element.skew.x, y: target[_key] }
                  ];

                case 'scaleX':
                  return [
                    'scale',
                    { y: memo.scale?.y ?? element.scale.y, x: target[_key] }
                  ];

                case 'scaleY':
                  return [
                    'scale',
                    { x: memo.scale?.x ?? element.scale.x, y: target[_key] }
                  ];

                default:
                  return [_key, target[_key]];
              }
            })();

            return {
              ...memo,
              [key]: value
            };
          },
          /**
           * @type {{
           *   skew?: { x?: number; y?: number };
           *   scale?: { x?: number; y?: number };
           *   [key: string]: unknown;
           * }}
           */ ({})
        )
      );
    })();
};
