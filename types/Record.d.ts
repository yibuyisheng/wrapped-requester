import IParameters from './IParameters';
import IOptions from './IOptions';
import Event from './Event';
export declare type State = 'READY' | 'LOADING' | 'SUCCESS' | 'FAIL' | 'TIMEOUT' | 'CANCELLED';
export default class Record extends Event {
    private state;
    private parameters?;
    private options?;
    private result;
    private error?;
    constructor(parameters: IParameters, options: IOptions);
    getResult(): any;
    getError(): Error | undefined;
    getParameters(): IParameters | undefined;
    getOptions(): IOptions | undefined;
    getState(): State;
    start(): void;
    success(result: any): void;
    fail(error: Error): void;
    timeout(): void;
    cancel(): void;
}
