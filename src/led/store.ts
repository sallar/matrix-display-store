/**
 * This file is heavily inspired by:
 * https://github.com/adafruit/Adafruit-GFX-Library
 * Released under the BSD License.
 * 
 * It has been ported to Javascript from C source code
 * by Sallar Kaboli to be used inside this project.
 * 
 * Copyright (c) 2012 Adafruit Industries. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { getRGBA, IRGBA } from './color';

export interface IPixel {
  on: boolean;
  color?: IRGBA;
}

export interface IMatrix extends Array<any> {
  [index: number]: IPixel;
}

export class Store {
  private x: number;
  private y: number;
  public matrix: IMatrix;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.fillScreen(null);
  }

  fill(x: number = 0, y: number = 0, r: number = 0, g: number = 0, b: number = 0, a: number = 1): void {
    // If not in boundries, dont paint
    if (x < this.x && y < this.y) {
      this.matrix[(y * this.x) + x] = {
        on: true,
        color: { r, g, b, a }
      };
    }
  }

  write(text: string, font: string[][], color: string): void {
    const lines = text.split('\n');
    const {r, g, b, a} = getRGBA(color);
    const CHAR_WIDTH = font[0].length;
    const CHAR_HEIGHT = font[0][0].length;

    lines.forEach((ch: string, line: number) => {
      // For each character
      for (let i = 0; i < ch.length; i += 1) {
        const ind = ch.charCodeAt(i) - 32;
        const fontRow = font[ind];
        // For each column
        for (let x = 0; x < CHAR_WIDTH; x += 1) {
          const col = fontRow[x];
          // For each pixel
          for (let y = 0; y < CHAR_HEIGHT; y += 1) {
            if (col[y] === '1') {
              this.fill(
                x + (i * CHAR_WIDTH),
                y + (line * CHAR_HEIGHT),
                r, g, b, a
              );
            }
          }
        }
      }
    });
  }

  drawPixel(x: number, y: number, c: IRGBA) {
    if (x < this.x && y < this.y) {
      this.matrix[(y * this.x) + x] = {
        on: true,
        color: c
      };
    }
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: IRGBA) {
    const steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);

    if (steep) {
      [x1, y1] = [y1, x1];
      [x2, y2] = [y2, x2];
    }

    if (x1 > x2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }

    let dx = x2 - x1;
    let dy = Math.abs(y2 - y1);
    let err = dx / 2;
    let ystep = (y1 < y2) ? 1 : -1;

    for (; x1 <= x2; x1 += 1) {
      if (steep) {
        this.drawPixel(y1, x1, color);
      } else {
        this.drawPixel(x1, y1, color);
      }

      err -= dy;

      if (err < 0) {
        y1 += ystep;
        err += dx;
      }
    }
  }

  drawFastVLine(x: number, y: number, h: number, color: IRGBA) {
    this.drawLine(x, y, x, y + h - 1, color);
  }

  drawFastHLine(x: number, y: number, w: number, color: IRGBA) {
    this.drawLine(x, y, x + w - 1, y, color);
  }

  drawRect(x: number, y: number, w: number, h: number, color: IRGBA) {
    this.drawFastHLine(x, y, w, color);
    this.drawFastHLine(x, y + h - 1, w, color);
    this.drawFastVLine(x, y, h, color);
    this.drawFastVLine(x + w - 1, y, h, color);
  }

  drawRoundRect(x: number, y: number, w: number, h: number, r: number, color: IRGBA) {
    // Lines
    this.drawFastHLine(x+r  , y    , w-2*r, color); // Top
    this.drawFastHLine(x+r  , y+h-1, w-2*r, color); // Bottom
    this.drawFastVLine(x    , y+r  , h-2*r, color); // Left
    this.drawFastVLine(x+w-1, y+r  , h-2*r, color); // Right

    // Corners
    this.drawCircleHelper(x+r    , y+r    , r, 1, color);
    this.drawCircleHelper(x+w-r-1, y+r    , r, 2, color);
    this.drawCircleHelper(x+w-r-1, y+h-r-1, r, 4, color);
    this.drawCircleHelper(x+r    , y+h-r-1, r, 8, color);
  }

  drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color: IRGBA) {
    this.drawLine(x1, y1, x2, y2, color);
    this.drawLine(x2, y2, x3, y3, color);
    this.drawLine(x3, y3, x1, y1, color);
  }

  drawCircleHelper(x1: number, y1: number, r: number, cornername: number, color: IRGBA) {
    let f     = 1 - r;
    let ddF_x = 1;
    let ddF_y = -2 * r;
    let x     = 0;
    let y     = r;

    while (x < y) {
      if (f >= 0) {
        y--;
        ddF_y += 2;
        f     += ddF_y;
      }
      x++;
      ddF_x += 2;
      f     += ddF_x;

      if (cornername & 0x4) {
        this.drawPixel(x1 + x, y1 + y, color);
        this.drawPixel(x1 + y, y1 + x, color);
      } 

      if (cornername & 0x2) {
        this.drawPixel(x1 + x, y1 - y, color);
        this.drawPixel(x1 + y, y1 - x, color);
      }

      if (cornername & 0x8) {
        this.drawPixel(x1 - y, y1 + x, color);
        this.drawPixel(x1 - x, y1 + y, color);
      }

      if (cornername & 0x1) {
        this.drawPixel(x1 - y, y1 - x, color);
        this.drawPixel(x1 - x, y1 - y, color);
      }
    }
  }

  drawCircle(x1: number, y1: number, r: number, color: IRGBA) {
    let f = 1 - r;
    let ddF_x = 1;
    let ddF_y = -2 * r;
    let x = 0;
    let y = r;

    this.drawPixel(x1  , y1+r, color);
    this.drawPixel(x1  , y1-r, color);
    this.drawPixel(x1+r, y1  , color);
    this.drawPixel(x1-r, y1  , color);
    
    while (x<y) {
      if (f >= 0) {
        y--;
        ddF_y += 2;
        f += ddF_y;
      }
      x++;
      ddF_x += 2;
      f += ddF_x;
    
      this.drawPixel(x1 + x, y1 + y, color);
      this.drawPixel(x1 - x, y1 + y, color);
      this.drawPixel(x1 + x, y1 - y, color);
      this.drawPixel(x1 - x, y1 - y, color);
      this.drawPixel(x1 + y, y1 + x, color);
      this.drawPixel(x1 - y, y1 + x, color);
      this.drawPixel(x1 + y, y1 - x, color);
      this.drawPixel(x1 - y, y1 - x, color);
    }
  }

  fillScreen(color: IRGBA | null) {
    let pixel: IPixel;
    if (color === null) {
      pixel = {
        on: false
      };
    } else {
      pixel = {
        on: true,
        color
      };
    }
    this.matrix = Array(this.x * this.y).fill(pixel);
  }

  fillRect(x: number, y: number, w: number, h: number, color: IRGBA) {
    for (let i = x; i < x + w; i += 1) {
      this.drawFastVLine(i, y, h, color);
    }
  }

  fillRoundRect(x: number, y: number, w: number, h: number, r: number, color: IRGBA) {
    this.fillRect(x+r, y, w-2*r, h, color);
    this.fillCircleHelper(x+w-r-1, y+r, r, 1, h-2*r-1, color);
    this.fillCircleHelper(x+r    , y+r, r, 2, h-2*r-1, color);
  }

  fillCircleHelper(x1: number, y1: number, r: number, cornername: number, delta: number, color: IRGBA) {
    let f       = 1 - r;
    let ddF_x   = 1;
    let ddF_y   = -2 * r;
    let x       = 0;
    let y       = r;

    while (x < y) {
      if (f >= 0) {
        y--;
        ddF_y += 2;
        f     += ddF_y;
      }
      x++;
      ddF_x += 2;
      f     += ddF_x;

      if (cornername & 0x1) {
        this.drawFastVLine(x1 + x, y1 - y, 2*y+1+delta, color);
        this.drawFastVLine(x1 + y, y1 - x, 2*x+1+delta, color);
      }

      if (cornername & 0x2) {
        this.drawFastVLine(x1 - x, y1 - y, 2*y+1+delta, color);
        this.drawFastVLine(x1 - y, y1 - x, 2*x+1+delta, color);
      }
    }
  }

  fillCircle(x: number, y: number, r: number, color: IRGBA) {
    this.drawFastVLine(x, y - r, 2 * r + 1, color);
    this.fillCircleHelper(x, y, r, 3, 0, color);
  }

  fillTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: IRGBA) {
    let a, b, y, last;

    // Sort coordinates by Y order (y2 >= y1 >= y0)
    if (y0 > y1) {
      [y0, y1] = [y1, y0];
      [x0, x1] = [x1, x0];
    }
    if (y1 > y2) {
      [y2, y1] = [y1, y2];
      [x2, x1] = [x1, x2];
    }
    if (y0 > y1) {
      [y0, y1] = [y1, y0];
      [x0, x1] = [x1, x0];
    }

    // Handle awkward all-on-same-line case as its own thing
    if (y0 === y2) {
      a = b = x0;
      if(x1 < a)      a = x1;
      else if(x1 > b) b = x1;
      if(x2 < a)      a = x2;
      else if(x2 > b) b = x2;
      this.drawFastHLine(a, y0, b-a+1, color);
      return;
    }

    let
      dx01 = x1 - x0,
      dy01 = y1 - y0,
      dx02 = x2 - x0,
      dy02 = y2 - y0,
      dx12 = x2 - x1,
      dy12 = y2 - y1,
      sa   = 0,
      sb   = 0;

    // For upper part of triangle, find scanline crossings for segments
    // 0-1 and 0-2.  If y1=y2 (flat-bottomed triangle), the scanline y1
    // is included here (and second loop will be skipped, avoiding a /0
    // error there), otherwise scanline y1 is skipped here and handled
    // in the second loop...which also avoids a /0 error here if y0=y1
    // (flat-topped triangle).
    last = (y1 === y2) ?
      y1 :    // Include y1 scanline
      y1 - 1; // Skip it

    for (y = y0; y <= last; y++) {
      a   = x0 + sa / dy01;
      b   = x0 + sb / dy02;
      sa += dx01;
      sb += dx02;
      /* longhand:
      a = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
      b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
      */
      if (a > b) {
        [a, b] = [b, a];
      }
      this.drawFastHLine(a, y, b - a + 1, color);
    }

    // For lower part of triangle, find scanline crossings for segments
    // 0-2 and 1-2.  This loop is skipped if y1=y2.
    sa = dx12 * (y - y1);
    sb = dx02 * (y - y0);
    for (; y <= y2; y++) {
      a   = x1 + sa / dy12;
      b   = x0 + sb / dy02;
      sa += dx12;
      sb += dx02;
      /* longhand:
      a = x1 + (x2 - x1) * (y - y1) / (y2 - y1);
      b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
      */
      if (a > b) {
        [a, b] = [b, a];
      }
      this.drawFastHLine(a, y, b - a + 1, color);
    }
  }

  drawBitmap(x: number, y: number, bitmap: Array<number>, w: number, h: number, color: IRGBA) {
    let i, j, byteWidth = Math.trunc((w + 7) / 8);

    for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++) {
        if (bitmap[Math.trunc(j * byteWidth + i / 8)] & (128 >> (i & 7))) {
          this.drawPixel(x + i, y + j, color);
        }
      }
    }
  }
}

export function createStore(x: number, y: number): Store {
  return new Store(x, y);
}
