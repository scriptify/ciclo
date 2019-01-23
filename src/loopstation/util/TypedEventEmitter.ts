export default interface TypedEventEmitter<Events> {
  emit<EventName extends keyof Events>(type: EventName, payload: Events[EventName]): void;

  addEventListener<EventName extends keyof Events>(
    type: EventName,
    cb: (p: Events[EventName]) => void,
  ): void;
}
