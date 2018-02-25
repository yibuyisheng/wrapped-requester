import IParameters from './IParameters';
import IOptions from './IOptions';
import axios, {CancelTokenSource} from 'axios';
import {get, includes} from 'lodash';
import Event from './Event';

export type State = 'READY' | 'LOADING' | 'SUCCESS' | 'FAIL' | 'TIMEOUT' | 'CANCELLED';

export default class Record extends Event {

    private state: State = 'READY';

    private parameters?: IParameters;

    private options?: IOptions;

    private result: any;

    private error?: Error;

    public constructor(parameters: IParameters, options: IOptions) {
        super();

        this.parameters = parameters;
        this.options = options;
        this.options.cancelToken = axios.CancelToken.source();
    }

    public getResult() {
        return this.result;
    }

    public getError() {
        return this.error;
    }

    public getParameters() {
        return this.parameters;
    }

    public getOptions() {
        return this.options;
    }

    public getState() {
        return this.state;
    }

    // 开始请求，储存相关数据
    public start(): void {
        if (this.state !== 'READY') {
            throw new Error('Wrong state.');
        }

        this.state = 'LOADING';
        this.emit('statechange', this);

        // 超时管理
        const time: number | undefined = get(this.getOptions(), 'time');
        if (typeof time === 'number') {
            // 如果到了超时时间还在 LOADING ，就说明超时了
            setTimeout(() => {
                if (this.state === 'LOADING') {
                    this.timeout();
                }
            }, time);
        }
    }

    public success(result: any) {
        if (this.state !== 'LOADING') {
            throw new Error('Wrong state.');
        }

        this.state = 'SUCCESS';
        this.result = result;
        this.emit('statechange', this);
    }

    public fail(error: Error) {
        if (this.state !== 'LOADING') {
            throw new Error('Wrong state.');
        }

        this.error = error;
        this.state = 'FAIL';
        this.emit('statechange', this);
    }

    public timeout() {
        if (this.state !== 'LOADING') {
            throw new Error('Wrong state.');
        }

        this.state = 'TIMEOUT';
        this.emit('statechange', this);
    }

    public cancel() {
        if (this.state !== 'LOADING' && this.state !== 'READY') {
            throw new Error('Wrong state.');
        }

        const cancelToken: CancelTokenSource | undefined = get(this, 'options.cancelToken');
        if (cancelToken) {
            cancelToken.cancel();
            this.state = 'CANCELLED';
            this.emit('statechange', this);
        }
    }

    public isSettled(): boolean {
        return !includes(['READY', 'LOADING'], this.state);
    }
}
