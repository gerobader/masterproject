// import {expose} from 'threads/worker';
//
// expose({
//   calculateStatisticalMeasures(input) {
//     return 'HELLO WELT';
//   }
// });

function worker() {
  self.addEventListener('message', (e) => { // eslint-disable-line no-restricted-globals
    console.log('henlo, this is worker');
    postMessage('This is my message:', e.data);
  });
}

export default worker;
