function sliceIntoChunks(arr, chunkSize) {
    // teilt ein Array arr in Stücke der Grösse chunkSize auf und gibt sie in ein gemeinsames übergeordnetes Array verpackt zurück. (z.B.: arr hat Länge 100, chunkSize=20 -> return-Wert ist ein Array, das 5 20er-Arrays enthält).
    const res = [];
    const fullChunks = Math.floor(arr.length / chunkSize);
    for (let i = 0; i < fullChunks; i++) {
        const chunk = arr.slice(i * chunkSize, (i + 1) * chunkSize);
        res.push(chunk);
    }
    if (arr.length % chunkSize != 0) {
        let lastChunk = arr.slice(fullChunks * chunkSize, arr.length)
        res.push(lastChunk)
    }
    return res;
}
module.exports = sliceIntoChunks;

