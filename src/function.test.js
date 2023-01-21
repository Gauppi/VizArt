
const sliceIntoChunks = require('./function');

const N = 7;
const CHUNK_SIZE = 50;

const arr = [];
for(let i = 0; i < CHUNK_SIZE * N; i++){
  arr.push(i);
}
const res = [];
for(let i = 0; i < N; i++) {
    const tmp = [];
    for(let j = 0; j < CHUNK_SIZE; j++) {
        tmp.push(i*CHUNK_SIZE + j);
    }
    res.push(tmp);
}

console.log(arr);
test(`slices a big array into 7 smaller chunks with the length 50`, () => {
  expect(sliceIntoChunks(arr, CHUNK_SIZE)).toStrictEqual(res);
});

