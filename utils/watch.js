// const observe = (obj, key, watchFun, deep, page) => {
//   let oldVal = obj[key];
//   if (oldVal !== null && typeof oldVal === 'object' && deep) {
//     Object.keys(oldVal).forEach(item => {
//       observe(oldVal, item, watchFun, deep, page);
//     });
//   }
//   Object.defineProperty(obj, key, {
//     set(value) {
//       if (value !== oldVal) {
//         watchFun.call(page, value, oldVal);
//       }
//       oldVal = value;
//     },
//     get() {
//       return oldVal;
//     }
//   });
// };

// export const setWatcher = (page) => {
//   const data = page.data;
//   const watch = page.watch;

//   Object.keys(watch).forEach(key => {
//     let targetData = data;
//     const targetKey = key;
//     const watchFun = watch[key].handler || watch[key];
//     const deep = watch[key].deep;
//     observe(targetData, targetKey, watchFun, deep, page);
//   });
// };