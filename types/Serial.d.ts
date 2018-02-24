import Base, { Requester } from './Base';
import IParameters from './IParameters';
import IOptions from './IOptions';
import Record, { State } from './Record';
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
    result: any;
    error: any;
    state: State;
    onStateChange: (record: Record) => void;
    private shouldWait;
    constructor(requester: Requester, shouldWait?: boolean);
    protected beforeRequest(parameters: IParameters, options: IOptions): Promise<{
        parameters: IParameters;
        options: IOptions;
    }>;
    protected recordCreated(record: Record): void;
    private clearRecords();
}
