function parameterRequired(name) {
  throw new Error(`Parameter ${name} is required`);
}

export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  addEventListener(type, cb = parameterRequired('callbackFn')) {
    if (this.events[type])
      this.events[type].push(cb);
    else
      this.events[type] = [cb];
  }

  emit(type, data) {
    if (!this.events[type])
      return;
    this.events[type].forEach(cb => cb(data));
  }
}
