const sortedArray = [
  3, 7, 12, 18, 21, 25, 29, 34, 38, 41, 45, 49, 52, 57, 61, 66, 70, 74, 79, 83,
  88, 92, 97, 101, 106, 110, 115, 119, 124, 128, 133, 137, 142, 146, 151, 155,
  160, 164, 169, 173, 178, 182, 187, 191, 196, 200, 205, 209, 214, 218, 223,
  227, 232, 236, 241, 245, 250, 254, 259, 263, 268, 272, 277, 281, 286, 290,
  295, 299, 304, 308, 313, 317, 322, 326, 331, 335, 340, 344, 349, 353, 358,
  362, 367, 371, 376, 380, 385, 389, 394, 398, 403, 407, 412, 416, 421, 425,
  430, 434, 439, 443,
];

let n = 169;

for (let i = 0; i < sortedArray.length; i++) {
  if (sortedArray[i] === n) {
    console.log(`${i}`);
    return;
  } else {
    console.log(`${i} not in array`);
  }
}

const bn = [3, 7, 12, 18, 21, 25, 29];

let t = 25;

for (let i = 0; i < bn.length; i++) {
  let mid = Math.floor(bn.length / 2);
  let left = 0;
  let right = mid;
  if (t === bn[mid]) {
    console.log("found");
    return;
  }
  if(t > bn[left]){
    right === mid
    console.log(`${right}`)
  }
  if(t < bn[right]){
    left === mid
    console.log(`${left}`)
  }

  if(!bn.includes(t)){
    console.log("not contained in array")
  }
}
