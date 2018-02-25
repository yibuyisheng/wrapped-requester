import Base, {Requester} from './Base';
import IParameters from './IParameters';
import IOptions from './IOptions';
import Record, {State} from './Record';
import {remove} from 'lodash';

/**
 * 请求处理策略：
 * - 可以同步多次调用 send 方法。
 * - 会记录请求发起的先后顺序。
 * - 某一时刻只会存在一个请求在执行。
 * - 后发起的请求的请求结果会覆盖前面请求的结果。
 * - 可以设置是否等待上一个请求结束之后，才执行当前请求：
 *   - 如果不等待，则直接 cancel 掉上一个请求，并马上开始当前请求。
 *   - 如果等待，则等到上一个请求状态变为结束态。
 *
 * 典型应用场景：
 * - 分页
 * - 表单提交
 */
export default class Serial extends Base {
    public result: any;

    public error: any;

    public state: State = 'READY';

    // stack 里面始终最多只会有一个 record ，所以这里可以放心去监听 state change ，
    // 而不用担心多个 record 的 state 互相缠绕。
    public onStateChange: (record: Record) => void = (() => {});

    private shouldWait: boolean;

    public constructor(requester: Requester, shouldWait: boolean = false) {
        super(requester);
        this.shouldWait = shouldWait;
    }

    protected async beforeRequest(record: Record): Promise<void> {
        record.on('statechange', () => {
            this.state = record.getState();
            this.error = record.getError();
            this.result = record.getResult();

            this.onStateChange(record);
        });

        if (!this.shouldWait) {
            this.clearRecords();
        } else if (this.stack.length > 1) {
            // 等前面的请求完毕
            await this.waitComplete();
        }
    }

    private async waitComplete() {
        const prevRecords = this.stack.slice(0, -1);
        const waitings = prevRecords.map((record) => {
            return new Promise((resolve) => {
                if (record.isSettled()) {
                    remove(this.stack, record);
                    resolve();
                    return;
                }

                record.on('statechange', () => {
                    if (record.isSettled()) {
                        remove(this.stack, record);
                        resolve();
                    }
                });
            });
        });
        await Promise.all(waitings);
    }

    // 对于“分页”类型的请求，期望的效果是后发起的请求结果覆盖前面的请求结果。
    // 所以后面发起的请求，会终止掉之前的请求，同一时刻只能存在一个处于 LOADING 的请求。
    private clearRecords(): void {
        if (this.stack.length <= 1) {
            return;
        }

        const record = this.stack.shift();
        if (record && !record.isSettled()) {
            record.cancel();
            record.off('statechange');
        }
    }
}
