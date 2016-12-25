# RGB LED Matrix

## Install

``` bash
$ npm install led-matrix --save-dev
# or
$ yarn add led-matrix
```

## Usage

``` js
import { LEDMatrix, createStore } from 'led-matrix';

const store = createStore(32, 16);
const matrix = new LEDMatrix(canvasElement, {
  x: 32,
  y: 16,
  // other options...
});
matrix.setData(store.matrix);
matrix.render();
```

### Options

``` typescript
{
  x: number;
  y: number;
  pixelWidth: number;
  pixelHeight: number;
  margin: number;
  glow: boolean;
  animated: boolean;
}
```

### Store methods


#### `store.write(text, font, color);`

``` js
store.write('Hi there\nHow are you?', font, '#FFFFFF');
```

#### `store.fill(x, y, r, g, b, a);`

``` js
store.fill(10, 15, 255, 0, 255, .5);
```

## License

Licensed under the [MIT License](LICENSE)
