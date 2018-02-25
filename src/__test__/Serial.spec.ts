import Serial from '../Serial';
import {State} from '../Record';

describe('Serial', () => {
    it('should cancel previous request immediately.', (done) => {
        const times = [500, 200, 100];
        const responses = [1, 2, 3];
        const requester = async () => {
            const time = times.shift();
            const response = responses.shift();
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(response);
                }, time);
            });
        };
        const states: State[] = [];
        const serial = new Serial(requester);
        serial.onStateChange = () => {
            states.push(serial.state);
        };
        serial.send({}, {});
        serial.send({}, {});
        serial.send({}, {});

        setTimeout(() => {
            expect(states).toEqual(['CANCELLED', 'CANCELLED', 'LOADING', 'SUCCESS']);
            expect(serial.state).toBe('SUCCESS');
            // 因为在 READY 状态下就给截下来了，没机会发请求，所以最终拿到的值是1
            expect(serial.result).toBe(1);
            done();
        }, 510);
    });

    it('should cancel previous request asynchronously.', (done) => {
        const times = [500, 200, 100];
        const responses = [1, 2, 3];
        const requester = async () => {
            const time = times.shift();
            const response = responses.shift();
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(response);
                }, time);
            });
        };
        const states: State[] = [];
        const serial = new Serial(requester);
        serial.onStateChange = () => {
            states.push(serial.state);
        };
        serial.send({}, {});
        setTimeout(() => {
            serial.send({}, {});

            setTimeout(() => {
                serial.send({}, {});
            });
        });

        setTimeout(() => {
            expect(states).toEqual(['LOADING', 'CANCELLED', 'LOADING', 'CANCELLED', 'LOADING', 'SUCCESS']);
            expect(serial.state).toBe('SUCCESS');
            expect(serial.result).toBe(3);
            done();
        }, 520);
    });

    it('should wait the previous request to complete.', (done) => {
        const times = [500, 200, 100];
        const responses = [1, 2, 3];
        const requester = async () => {
            const time = times.shift();
            const response = responses.shift();
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(response);
                }, time);
            });
        };
        const states: State[] = [];
        const serial = new Serial(requester, true);
        serial.onStateChange = () => {
            states.push(serial.state);
        };
        serial.send({}, {});
        serial.send({}, {});
        serial.send({}, {});

        setTimeout(() => {
            expect(states).toEqual(['LOADING', 'SUCCESS', 'LOADING', 'SUCCESS', 'LOADING', 'SUCCESS']);
            expect(serial.state).toBe('SUCCESS');
            expect(serial.result).toBe(3);
            done();
        }, 810);
    });
});
