// 创建一个类 用来收集数据依赖，Es6语法
class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  addEffect(effect) {
    this.subscribers.add(effect);
  }

  notify() {
    this.subscribers.forEach((effect) => {
      effect();
    });
  }
}

// 定义数据
const info = { counter: 100 };
// 使用数据
function doubleCounter() {
  console.log(info.counter * 2);
}

function powerCounter() {
  console.log(info.counter * info.counter);
}
// doubleCounter();
// powerCounter()
const dep = new Dep();

// 收集依赖
dep.addEffect(doubleCounter);
dep.addEffect(powerCounter);
// -----------------------------------------------------
// 数据更新
info.counter++;
// 依赖更新
// doubleCounter();
// powerCounter();
dep.notify();
