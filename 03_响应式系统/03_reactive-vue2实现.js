// 创建一个类 用来收集数据依赖，Es6语法
// ---------功能代码-------------
class Dep {
  constructor() {
    this.subscribers = new Set();
  }
  // depend用于收集依赖数据的项
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }
  // 当数据更新时notify用于更新所有依赖项的数据
  notify() {
    this.subscribers.forEach((effect) => {
      effect();
    });
  }
}
// const dep = new Dep();

let activeEffect = null;

// 定义一个监听函数watchEffect()
function watchEffect(effect) {
  activeEffect = effect;
  // 默认打开浏览器就执行一次函数
  effect();
  activeEffect = null;
}
// Map({key:value}) key是一个字符串
// WeakMap({key(对象)：value}) key是一个对象，弱引用
const targetMap = new WeakMap();
// getDep的作用：根据不同的target获得不同的dep
function getDep(target, key) {
  // 根据对象（target）取出对应的Map对象
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  // 2.取出具体的dep对象
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}

// raw :未加工的原始数据
// vue2 对raw进行数据劫持
function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    const dep = getDep(raw, key);
    let value = raw[key];

    Object.defineProperty(raw, key, {
      // 收集依赖
      get() {
        dep.depend();
        return value;
      },
      // 数据跟新就通知所有依赖跟新数据
      set(newValue) {
        if (value !== newValue) {
          value = newValue;
          dep.notify();
        }
      },
    });
  });

  return raw;
}

// --------------测试代码-----------------------------

// 定义数据
const info = reactive({ counter: 100, name: 'why' });
const foo = reactive({ height: 1.88 });
// 调用监听函数收集数据依赖
// watchEffect 1
watchEffect(function doubleCounter() {
  console.log('effect1:', info.counter * 2, info.name);
});
// watchEffect 2
watchEffect(function powerCounter() {
  console.log('effect2:', info.counter * info.counter);
});
// watchEffect 3
watchEffect(function () {
  console.log('effect3:', info.counter + 10, info.name);
});
// watchEffect 4
watchEffect(function () {
  console.log('effect4:', foo.height);
});

// 数据更新
info.counter++;
info.name = 'Hanmeimei';
foo.height = '2.05';
