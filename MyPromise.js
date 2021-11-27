const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

function MyPromise(executor) {
  this.status = PENDING;
  this.value = null;
  this.reason = null;
  this.onResolvedCallbacks = [];
  this.onRejectedCallbacks = [];

  const resolve = (value) => {
    if (value instanceof MyPromise) {
      return value.then(resolve, reject);
    }

    setTimeout(() => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach(func => {
          func(value)
        });
      }
    });
  };

  const reject = (reason) => {
    setTimeout(() => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(func => {
          func(reason)
        });
      }
    });
  };

  try {
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}

const resolvePromise = (promise2, result, resolve, reject) => {
  if (result === promise2) {
    reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
  }

  let called;
  if ((typeof result === 'object' && result !== null) || typeof result === 'function') {
    try {
      let thenable = result.then;
      if (typeof thenable === 'function') {
        thenable.call(result, data => {
          if (called) {
            return;
          }
          called = true;
          resolvePromise(promise2, data, resolve, reject);
        }, err => {
          if (called) {
            return;
          }
          called = true;
          reject(err);
        });
      } else {
        resolve(result);
      }
    } catch (e) {
      if (called) {
        return;
      }
      called = true;
      reject(e);
    }
  } else {
    resolve(result);
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : data => data;
  onRejected = typeof onRejected === 'function' ? onRejected : error => error;

  let promise2 = new MyPromise((resolve, reject) => {
    if (this.status === FULFILLED) {
      setTimeout(() => {
        try {
          let result = onFulfilled(this.value);
          resolvePromise(promise2, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }

    if (this.status === REJECTED) {
      setTimeout(() => {
        try {
          let result = onRejected(this.reason);
          resolvePromise(promise2, result, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }

    if (this.status === PENDING) {
      this.onResolvedCallbacks.push(() => {
        setTimeout(() => {
          try {
            let result = onFulfilled(this.value);
            resolvePromise(promise2, result, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });

      this.onRejectedCallbacks.push(() => {
        setTimeout(() => {
          try {
            let result = onRejected(this.reason);
            resolvePromise(promise2, result, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  });

  return promise2;
}

MyPromise.prototype.catch = function(catchFunc) {
  return this.then(null, catchFunc);
}

MyPromise.resolve = function(value) {
  return new MyPromise((resolve, reject) => {
    resolve(value);
  });
}

MyPromise.reject = function(value) {
  return new MyPromise((resolve, reject) => {
    reject(value);
  });
}

MyPromise.all = function(promiseArray) {
  if (!Array.isArray(promiseArray)) {
    const type = typeof promiseArray;
    throw new TypeError(`TypeError: ${type} ${promiseArray} is not iterable`);
  }

  return new MyPromise((resolve, reject) => {
    try {
      let resultArray = [];
      for (let i = 0; i < promiseArray.length; i++) {
        promiseArray[i].then(data => {
          resultArray.push(data);

          if (resultArray.length === promiseArray.length) {
            resolve(resultArray);
          }
        }, reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}

MyPromise.race = function(promiseArray) {
  if (!Array.isArray(promiseArray)) {
    const type = typeof promiseArray;
    throw new TypeError(`TypeError: ${type} ${promiseArray} is not iterable`);
  }

  return new MyPromise((resolve, reject) => {
    try {
      for (let i = 0; i < promiseArray.length; i++) {
        promiseArray[i].then(resolve, reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}
