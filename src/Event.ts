// 超级简单，但是够用的事件管理类
export default class Event {
    private handlerMap: {
        [eventName: string]: Array<(...args: any[]) => void>;
    } = {};

    public on(eventName: string, handler: () => void) {
        const handlers = this.handlerMap[eventName] || [];
        handlers.push(handler);
        this.handlerMap[eventName] = handlers;
    }

    public off(eventName: string) {
        this.handlerMap[eventName] = [];
    }

    public emit(eventName: string, ...args: any[]) {
        const handlers = this.handlerMap[eventName];

        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(...args);
                } catch {}
            });
        }
    }
}
