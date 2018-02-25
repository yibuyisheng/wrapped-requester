import Record from '../Record';
import IParameters from '../IParameters';
import IOptions from '../IOptions';

describe('Record', () => {
    it('should save parameters and options.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);
        expect(record.getParameters()).toBe(parameters);
        expect(record.getOptions()).toBe(options);
    });

    it('should create a cancelToken.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);
        expect(options).toHaveProperty('cancelToken');
    });

    it('should change state to `LOADING` after call `start` method.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);
        record.start();
        expect(record.getState()).toBe('LOADING');
    });

    it('should only be started once.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);
        record.start();
        expect(() => record.start()).toThrow('Wrong state.');
    });

    it('should change to timeout state if not settled in specified time.', (done) => {
        const parameters: IParameters = {};
        const options: IOptions = {time: 500};
        const record = new Record(parameters, options);
        record.start();
        setTimeout(() => {
            expect(record.getState()).toBe('TIMEOUT');
            done();
        }, 1000);
    });

    it('should not change to other state when timeout if settled.', (done) => {
        const parameters: IParameters = {};
        const options: IOptions = {time: 500};
        const record = new Record(parameters, options);
        record.start();

        setTimeout(() => {
            record.success(null);
        }, 400);

        setTimeout(() => {
            expect(record.getState()).toBe('SUCCESS');
            done();
        }, 1000);
    });

    it('should change to `SUCCESS` state only if current state is `LOADING`.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};

        let record = new Record(parameters, options);
        expect(() => record.success(null)).toThrow('Wrong state.');

        record.start();
        record.success(null);
        expect(record.getState()).toBe('SUCCESS');
        expect(() => record.success(null)).toThrow('Wrong state.');

        record = new Record(parameters, options);
        record.start();
        record.fail(new Error('error'));
        expect(() => record.success(null)).toThrow('Wrong state.');

        record = new Record(parameters, options);
        record.start();
        record.timeout();
        expect(() => record.success(null)).toThrow('Wrong state.');

        record = new Record(parameters, options);
        record.start();
        record.cancel();
        expect(() => record.success(null)).toThrow('Wrong state.');
    });

    it('should save fail error.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);

        record.start();
        const error = new Error();
        record.fail(error);
        expect(record.getError()).toBe(error);
    });

    it('should be settled only if the state is not `READY` or `LOADING`.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);

        expect(record.getState()).toBe('READY');
        expect(record.isSettled()).toBe(false);
        record.start();
        expect(record.getState()).toBe('LOADING');
        expect(record.isSettled()).toBe(false);
        record.success(null);
        expect(record.isSettled()).toBe(true);
    });

    it('should change to `FAIL` state only if current state is `LOADING`.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);

        record.start();
        record.fail(new Error(''));
        expect(record.getState()).toBe('FAIL');
        expect(() => record.fail(new Error(''))).toThrow('Wrong state.');
    });

    it('should change to `TIMEOUT` state only if current state is `LOADING`.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);

        record.start();
        record.timeout();
        expect(record.getState()).toBe('TIMEOUT');
        expect(() => record.timeout()).toThrow('Wrong state.');
    });

    it('should change to `CANCELLED` state only if current state is `LOADING`.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);

        record.start();
        record.cancel();
        expect(record.getState()).toBe('CANCELLED');
        expect(() => record.cancel()).toThrow('Wrong state.');
    });

    it('should not change state to `CANCELLED` if there is not a cancelToken.', () => {
        const parameters: IParameters = {};
        const options: IOptions = {};
        const record = new Record(parameters, options);

        record.start();
        options.cancelToken = null;
        record.cancel();
        expect(record.getState()).toBe('LOADING');
    });
});
