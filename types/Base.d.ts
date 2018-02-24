import IParameters from './IParameters';
import IOptions from './IOptions';
import Record from './Record';
export declare type Requester = (parameters: IParameters, options: IOptions) => Promise<any>;
export default class Base {
    protected requester: Requester;
    protected stack: Record[];
    constructor(requester: Requester);
    send(parameters: IParameters, options: IOptions): Promise<void>;
    protected beforeRequest(parameters: IParameters, options: IOptions): Promise<{
        parameters: IParameters;
        options: IOptions;
    }>;
    protected recordCreated(record: Record): void;
    protected requestSuccess(result: any, record: Record): void;
    protected requestFail(error: Error, record: Record): void;
    protected afterResponse(record: Record): void;
    protected completeRequest(record: Record): void;
}
