/**
 *  用户继承不同角色的权限
 *  使用 class + prototype 实现
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

class Admin {
  constructor(info) {
    this.info = info;
  }
}
Admin.prototype.permission = deepFreeze({ ...roleList.admin.permission }); // 在实例的属性中添加(由于permission为对象，是引用类型，如果不做浅拷贝，当permission被修改时，将会影响基于Guest派生的所有实例。当然，在这里由于使用了Object.freeze冻结了对象不能被修改)

class Guest {
  constructor(info) {
    this.info = info;
    this.permission = deepFreeze({ ...roleList.guest.permission }); // 在实例的属性中添加(由于permission为对象，是引用类型，如果不做浅拷贝，当permission被修改时，将会影响基于Guest派生的所有实例。当然，在这里由于使用了Object.freeze冻结了对象不能被修改)
  }
}

const personA = { name: 'Hazard', age: 18, sex: 'male' };

const personB = { name: 'Kante', age: 26, sex: 'male' };

const personC = { name: 'Baddie', age: 26, sex: 'male' };

const personA_Permission = new Admin(personA);
const personB_Permission = new Guest(personB);
const personC_Permission = new Guest(personC); // 他是一个尝试执行非法操作的用户
logPermission(personA_Permission);
logPermission(personB_Permission);
logPermission(personC_Permission);
console.log('personA_Permission', personA_Permission);
console.log('personB_Permission', personB_Permission);
console.log('personC_Permission', personC_Permission);
// 尝试篡改权限
try {
  personC_Permission.permission = roleList.admin.permission; // 由于Admin的权限在原型上，personC_Permission用户尝试修改自己的实例，从而实现修改权限的目的
  logPermission(personC_Permission); // 打印personC_Permission的最新权限
  personB_Permission.permission.del = true; // 报错
} catch (error) {
  console.error(error);
}
