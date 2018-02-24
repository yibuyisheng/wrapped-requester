export default class Event {
    private handlerMap;
    on(eventName: string, handler: () => void): void;
    off(eventName: string): void;
    emit(eventName: string, ...args: any[]): void;
}
