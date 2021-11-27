function MyPromise(executor) {
  this.status = 'pending';
  this.value = null;
  this.reason = null;
  this.onFulfilledArray = [];
  this.onRejectedArray = [];

  const resolve = (value) => {
    if (value instanceof MyPromise) {
      return value.then(resolve, reject);
    }
    setTimeout(() => {
      if (this.status === 'pending') {
        this.status = 'fulfilled';
        this.value = value;
  
        this.onFulfilledArray.forEach(func => {
          func(value)
        });
      }
    });
  };

  const reject = (reason) => {
    setTimeout(() => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
  
        this.onRejectedFunc.forEach(func => {
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

MyPromise.prototype.then = function(onfulfilled, onrejected) {
  onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : data => data;
  onrejected = typeof onrejected === 'function' ? onrejected : error => error;
  if (this.status === 'fulfilled') {
    onfulfilled(this.value);
  }

  if (this.status === 'rejected') {
    onrejected(this.reason);
  }

  if (this.status === 'pending') {
    this.onFulfilledArray.push(onfulfilled);
    this.onRejectedArray.push(onrejected);
  }
}

let promise2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(new MyPromise((resolve1, reject1) => {
      resolve1('resolve1');
    }));
  });
});

promise2.then(data => {
  console.log(data);
}, error => {
  console.log(error);
});

promise2.then(data => {
  console.log('like ' + data);
})

console.log(2);
