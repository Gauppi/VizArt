const sliceIntoChunks = require('./script');

let idList = [];
let chunk = [];
let resList = []
for(let i = 1; i <= 4567; i++){
    idList.push(i);
}
for(let i = 0; i < idList.length; i++){
    if(i % 1000 == 0){
        resList.push(chunk);
    }
    chunk.push(i);
}

test('erwarten 1000 Chunks', () => {
    expect(sliceIntoChunks(idList, 1000)).toBe(resList)
})