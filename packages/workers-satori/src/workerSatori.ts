import satori, {init} from "satori/wasm";
import initYoga from "yoga-wasm-web";
import {parseHtml} from "./parseHtml";
import {loadGoogleFont} from "./font";
import type {ImageResponseOptions} from "./types";
import {loadDynamicAsset} from "./emoji";

// @ts-expect-error .wasm files are not typed
import yogaWasm from "../vendors/yoga.wasm";

const initYogaWasm = async () => {
  try {
    const yoga = await initYoga(yogaWasm);
    init(yoga);
  } catch (err) {
    throw err;
  }
};

interface Props {
  /**
   * The React element or HTML string to render into an image.
   * @example
   * ```tsx
   * <div
   *  style={{
   *    display: 'flex',
   *  }}
   * >
   *  <h1>Hello World</h1>
   * </div>
   * ```
   * @example
   * ```html
   * <div style="display:flex;"><h1>Hello World</h1></div>
   * ```
   */
  element: string | React.ReactNode;
  /**
   * The options for the image response.
   */
  options: ImageResponseOptions;
}

export const workerSatori = async ({ element, options }: Props) => {
  // 1. Init WASMs
  await Promise.allSettled([initYogaWasm()]);

  // 2. Get React Element
  const reactElement =
    typeof element === "string" ? await parseHtml(element) : element;

  // 3. Convert React Element to SVG with Satori
  const width = options.width;
  const height = options.height;

  let widthHeight:
    | { width: number; height: number }
    | { width: number }
    | { height: number } = {
    width: 1200,
    height: 630,
  };

  if (width && height) {
    widthHeight = { width, height };
  } else if (width) {
    widthHeight = { width };
  } else if (height) {
    widthHeight = { height };
  }

  return await satori(reactElement, {
    ...widthHeight,
    fonts: !!options?.fonts?.length
        ? options.fonts
        : [
          {
            name: "Bitter",
            data: await loadGoogleFont({family: "Bitter", weight: 600}),
            weight: 500,
            style: "normal",
          },
        ],
    loadAdditionalAsset: options.emoji
        ? loadDynamicAsset({
          emoji: options.emoji,
        })
        : undefined,
  });
};

export class ImageResponse extends Response {
  constructor(
    element: string | React.ReactNode,
    options: ImageResponseOptions,
  ) {
    super();

    return (async () => {
      const svg = await workerSatori({ element, options });
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": options.debug
              ? "no-cache, no-store"
              : "public, immutable, no-transform, max-age=31536000",
          ...options.headers,
        },
        status: options.status || 200,
        statusText: options.statusText,
      });
    })() as unknown as ImageResponse;
  }
}
