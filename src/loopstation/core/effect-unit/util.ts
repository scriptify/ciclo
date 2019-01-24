export const bindMethodsToValues = (values: Value[], param: any) : BoundValue[] =>
  values.map((value) => {
    if (!(typeof value.set === 'function')) {
      throw new Error(`
      The specified value for the 'set'-field of the '${value.name}' - value is not a function!
    `);
    }
    return {
      ...value,
      set: value.set.bind(undefined, param),
    };
  });

export const functionsToValues = (obj: EffectChainParams): EffectChain => {
  /*
    If a member of the object (obj) is a function,
    the return value of this function will be set as the value of this property
  */
  const retObj = Object.assign({}, obj);

  Object.keys(retObj).forEach((key) => {
    if (typeof retObj[key] === 'function') {
      const fn = retObj[key] as (() => AudioNode);
      retObj[key] = fn();
    }
  });

  return retObj as EffectChain;
};

export const objToArray = (obj: any) => {
  const arr: any[] = [];
  Object.keys(obj).forEach((key) => {
    arr.push(obj[key]);
  });
  return arr;
};

export const filterValue = (values: BoundValue[], valueName: string) => {
  const filteredValue = values.filter(val => val.name === valueName)[0];

  if (!filteredValue) {
    throw new Error(`Tried to access inexistent value '${valueName}'.`);
  }
  return filteredValue;
};
