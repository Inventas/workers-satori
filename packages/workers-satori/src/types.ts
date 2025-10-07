import type { ImageResponse } from "@vercel/og";

type VercelImageResponseOptions = NonNullable<
  ConstructorParameters<typeof ImageResponse>[1]
>;

export type ImageResponseOptions = Omit<
  VercelImageResponseOptions,
  "width" | "height"
> & {
  /**
   * The width of the image. If neither width nor height is provided, the default is 1200.
   *
   * @type {number}
   */
  width?: number;
  /**
   * The height of the image. If neither width nor height is provided, the default is 630.
   *
   * @type {number}
   */
  height?: number;
};
