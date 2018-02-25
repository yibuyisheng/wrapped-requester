import IParameters from './IParameters';
import IOptions from './IOptions';
import Record from './Record';
import {includes} from 'lodash';

export type Requester = (parameters: IParameters, options: IOptions) => Promise<any>;

export default class Base {

    protected requester: Requester;

    protected stack: Record[] = [];

    public constructor(requester: Requester) {
        this.requester = requester;
    }

    public async send(parameters: IParameters, options: IOptions): Promise<void> {
        ({parameters, options} = this.prepare(parameters, options));
        const record = new Record(parameters, options);
        this.stack.push(record);

        await this.beforeRequest(record);
        if (record.isSettled()) {
            this.completeRequest(record);
            return;
        }
        record.start();

        try {
            const result = await this.requester(parameters, options);
            if (record.getState() === 'LOADING') {
                record.success(result);
            }
        } catch (error) {
            if (record.getState() === 'LOADING') {
                try {
                    this.requestFail(error, record);
                } catch {}

                record.fail(error);
            }
        } finally {
            // 没有写在 try block 里面主要是为了避免
            // 由于 requestSuccess 里面抛出异常而进入到 requestFail 。
            if (record.getState() === 'SUCCESS') {
                // 包在 try block 里面是为了防止 requestSuccess 里面抛出异常，
                // 导致进不到 afterResponse，同时状态也无法重置。
                try {
                    this.requestSuccess(record.getResult(), record);
                } catch {}
            }

            if (includes(['SUCCESS', 'FAIL'], record.getState())) {
                this.afterResponse(record);
            }

            this.completeRequest(record);
        }
    }

    protected prepare(
        parameters: IParameters,
        options: IOptions,
    ): {
        parameters: IParameters,
        options: IOptions,
    } {
        return {
            parameters,
            options,
        };
    }

    protected async beforeRequest(record: Record): Promise<void> {}

    protected requestSuccess(result: any, record: Record): void {}

    protected requestFail(error: Error, record: Record): void {}

    // 正常返回的回调方法，不管请求是失败了还是成功了。
    protected afterResponse(record: Record): void {}

    // 无论发生什么情况，请求最后都会调用的方法。
    protected completeRequest(record: Record): void {}
}
