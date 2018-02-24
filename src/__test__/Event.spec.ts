import Event from '../Event';

describe('Event', () => {
    it('should register event callback.', () => {
        const event = new Event();
        const mockHandler = jest.fn();
        event.on('click', mockHandler);

        event.emit('click');
        expect(mockHandler.mock.calls.length).toBe(1);
        event.emit('click');
        expect(mockHandler.mock.calls.length).toBe(2);
    });

    it('should register multiple handlers to one event.', () => {
        const event = new Event();
        const mockHandler1 = jest.fn();
        const mockHandler2 = jest.fn();
        event.on('click', mockHandler1);
        event.on('click', mockHandler2);

        event.emit('click');
        expect(mockHandler1.mock.calls.length).toBe(1);
        expect(mockHandler2.mock.calls.length).toBe(1);
        event.emit('click');
        expect(mockHandler1.mock.calls.length).toBe(2);
        expect(mockHandler2.mock.calls.length).toBe(2);
    });

    it('should remove handlers.', () => {
        const event = new Event();
        const mockHandler = jest.fn();
        event.on('click', mockHandler);

        event.emit('click');
        expect(mockHandler.mock.calls.length).toBe(1);

        event.off('click');
        event.emit('click');
        expect(mockHandler.mock.calls.length).toBe(1);
    });

    it('should pass parameters by emit.', () => {
        const event = new Event();
        const mockHandler = jest.fn();
        event.on('click', mockHandler);

        event.emit('click', 'yibuyisheng');
        expect(mockHandler.mock.calls[0][0]).toBe('yibuyisheng');
    });

    it('should not throw error while the handler throws error.', () => {
        const event = new Event();
        const handler = () => {
            throw new Error('error');
        };
        event.on('click', handler);

        let failed = false;
        try {
            event.emit('click');
        } catch {
            failed = true;
        }
        expect(failed).toBe(false);
    });

    it('should do nothing if there is no proper handlers.', () => {
        const event = new Event();
        const mockHandler = jest.fn();
        event.on('click', mockHandler);

        event.emit('hover');
        expect(mockHandler.mock.calls.length).toBe(0);
    });
});
