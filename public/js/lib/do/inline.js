//必须放在head的前面，执行时间~3ms可以忽略
//配合它，do.js放在最后

var Do = function() { 
  Do.actions.push([].slice.call(arguments));
};

Do.ready = function() {
  Do.actions.push([].slice.call(arguments));
};

Do.add = Do.define = function(name, opts) {
  Do.mods[name] = opts;
};

Do.global = function() {
  Do.global.mods = Array.prototype.concat(Do.global.mods, [].slice.call(arguments));
};

Do.global.mods = [];
Do.mods = {};
Do.actions = [];
