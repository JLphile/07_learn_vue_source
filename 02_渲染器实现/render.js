const h = (tag, props, children) => {
  // vnode->javascript 对象
  return {
    tag,
    props,
    children,
  };
};

const mount = (vnode, container) => {
  // vnode->element
  // 1.创建出真实的原生，并且在vnode上保留el
  const el = (vnode.el = document.createElement(vnode.tag));
  //   2.处理props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];
      //事件监听的判断
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  //3.处理children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children;
    } else {
      // 递归
      vnode.children.forEach((item) => {
        mount(item, el);
      });
    }
  }
  //   4.将el挂载到container上
  container.appendChild(el);
};

// 5.diff算法
const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement;
    n1ElParent.removeChild(n1.el);
    mount(n2, n1ElParent);
  } else {
    // 1.取出element对象，并且在n2中进行保存
    const el = (n2.el = n1.el);
    // 2.处理props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 2.1 获取所有的newProps添加到el
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (newValue !== oldValue) {
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue);
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }
    // 2.2 删除旧的props
    for (const key in oldProps) {
      if (key.startsWith('on')) {
        //对事件监听的判断
        const value = oldProps[key];
        el.removeEventListener(key.slice(2).toLowerCase(), value);
      }
      if (!(key in newProps)) {
        el.removeAttribute(key);
      }
    }
    // 3.处理children
    const oldChildren = n1.children || [];
    const newChildren = n2.children || [];
    // 边界判断
    if (typeof newChildren === 'string') {
      //情况一：newChildren本身是一个string
      if (newChildren !== oldChildren) {
        el.textContent = newChildren;
      } else {
        el.innerHTML = newChildren;
      }
    } else {
      //情况二：newChildren本身是一个数组
      if (typeof oldChildren === 'string') {
        el.innerHTML = '';
        newChildren.forEach((item) => {
          mount(item, el);
        });
      } else {
        // oldChildren:[v1,v2,v3]
        // newChildren:[v1,v5,v6,v7,v8]
        // diff算法：如果newChildren更长，那么diff结束后进行添加操作，如果oldChildren更长，diff结束后进行删除操作
        // 1.前面有相同节点的原生进行patch操作
        const commonLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }
        // 2.如果newChildren.length>oldChildren.length，那么diff结束后进行添加操作
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((item) => {
            mount(item, el);
          });
        }
        // 3.newChildren.length < oldChildren.length,diff结束后进行删除操作
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach((item) => {
            el.removeChild(item.el);
          });
        }
      }
    }
  }
};
