import { hexToRGB } from './tools';

export interface IRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class Color {
  public static hex(hexStr: string | number): IRGBA {
    const [r, g, b] = hexToRGB(hexStr);
    return {
      r, g, b, a: 1
    };
  }

  public static rgba(r: number, g: number, b: number, a: number = 1): IRGBA {
    return {
      r, g, b, a
    };
  }
}
