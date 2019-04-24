/**
 *  用户继承不同角色的权限
 *  使用 Object.create 实现
 *  差异化继承（differential inheritance）通过定制一个新的对象，我们指明它与所基于的基本对象的区别。-- 出自 《JavaScript语言精髓》
 *  这个例子里，相同的是每个角色对应的权限，差异化的是角色的name,age,sex
 */

// 深冻结函数，防止篡改
const deepFreeze = function(obj) {
  // 取回定义在obj上的属性名
  const propNames = Object.getOwnPropertyNames(obj);

  // 在冻结自身之前冻结属性
  propNames.forEach(name => {
    const prop = obj[name];

    // 如果prop是个对象，冻结它
    if (typeof prop === 'object' && prop !== null) deepFreeze(prop);
  });

  // 冻结自身(no-op if already frozen)
  return Object.freeze(obj);
};

// 打印权限
const logPermission = p => {
  const { info, permission } = p;
  Object.keys(permission).forEach(key => {
    if (permission[key] === true) {
      console.log(`用户名为${info.name}的用户，拥有的权限: ${key}`);
    }
  });
};

// 角色权限表
const roleList = deepFreeze({
  // 管理员
  admin: {
    permission: {
      login: true,
      add: true,
      del: true,
      query: true,
    },
  },
  // 访客
  guest: {
    permission: {
      login: true,
      add: false,
      del: false,
      query: true,
    },
  },
});

/**
 * 继承角色权限
 * @param {String} role 角色名称
 * @param {Object} user 用户基础信息
 */
const addPermission = (role, user) => {
  const that = Object.create(roleList[role]);
  that.info = {};
  Object.entries(user).forEach(item => {
    const [key, value] = item;
    that.info[key] = value;
  });
  return deepFreeze(that);
};

const personA = { name: 'Hazard', age: 18, sex: 'male' };

const personB = { name: 'Kante', age: 26, sex: 'male' };

const personA_Permission = addPermission('admin', personA);

const personB_Permission = addPermission('guest', personB);

logPermission(personA_Permission);
logPermission(personB_Permission);
console.log('personA_Permission', personA_Permission);
console.log('personB_Permission', personB_Permission);
// 尝试篡改权限
try {
  personB_Permission.permission.del = true; // 注意，由于原型上的permission为对象，是引用类型。如果此操作执行成功，将会影响基于Guest派生的所有实例（但这里由于使用了Object.freeze冻结了对象，所以就不存在这个问题了）
  logPermission(personB_Permission);
} catch (error) {
  console.error(error);
}

// 猫
const Cat = {
  say() {
    console.log('meow~');
  },
  jump() {
    console.log('jump');
  },
};

// 老虎（猫科动物）
const Tiger = Object.create(Cat, {
  say: {
    writable: true,
    configurable: true,
    enumerable: true,
    value: function() {
      console.log('roar!');
    },
  },
});

const anotherCat = Object.create(Cat);

anotherCat.say();

const anotherTiger = Object.create(Tiger);

anotherTiger.say();
