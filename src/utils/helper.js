function replaceAll(obj, toFind, toReplace) {
  if (Array.isArray(obj)) {
    obj.forEach(element => {
      replaceAll(element, toFind, toReplace);
    });
  }
  const props = Object.keys(obj);

  props.forEach((prop) => {
    if (prop === toFind) {
      obj[toReplace] = obj[toFind];
      delete obj[toFind];
    } else if (obj[prop] instanceof Object || Array.isArray(obj[prop])) {
      replaceAll(obj[prop], toFind, toReplace);
    }
  });
  return obj;
}

module.exports = { replaceAll };
