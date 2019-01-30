function parameterRequired(name: string): never {
  throw new Error(`Parameter ${name} is required`);
}

export default class EventEmitter {
  events: {
    [eventName: string]: Function[],
  } = {};

  addEventListener(type: string, cb: Function = parameterRequired('callbackFn')): void {
    if (this.events[type]) {
      this.events[type].push(cb);
    } else {
      this.events[type] = [cb];
    }
  }

  removeAll() {
    this.events = {};
  }

  removeEventListener(type: string, cb: Function): void {
    this.events[type] = this.events[type].filter(currCb => currCb.toString() !== cb.toString());
  }

  emit(type: string, data?: any): void {
    if (!this.events[type]) return;
    this.events[type].forEach(cb => cb(data));
  }
}
