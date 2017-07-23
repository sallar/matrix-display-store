import 'mocha';
import { assert } from 'chai';
import { Store, getRGBA, PicoPixel } from '../src/';

const output = `XX  XX    XX  XX    XX  XX      
  X   X X   X   X X   X   X     
 X   X     X   X     X   X      
X   X   X X   X   X X   X       
XXX XXX   XXX XXX   XXX XXX     
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                `;

const WIDTH = 32;
const HEIGHT = 16;

function storeToString(store: Store) {
  const strs: string[][] = [];
  for (let i = 0; i < store.matrix.length; i += 1) {
    const dy = Math.floor(i / WIDTH);
    const dx = i - dy * WIDTH;
    const { on } = store.matrix[i];

    strs[dy] = strs[dy] || [];
    strs[dy][dx] = on ? "X" : " ";
  }
  return strs.map(line => line.join("")).join("\n");
}

describe('Text', () => {
  it('Writes text', () => {
    const store = new Store(WIDTH, HEIGHT);
    store.write(0, 0, "22:22:22", PicoPixel, 1, getRGBA("#ff0000"));
    assert.equal(storeToString(store), output);
  });
});
