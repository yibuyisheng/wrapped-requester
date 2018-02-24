import Base from './Base';
import IParameters from './IParameters';
import IOptions from './IOptions';
import Record, { State } from './Record';
/**
 * 请求处理策略
 * - 可以同步多次调用 send 方法。
 * - 某一时刻可能存在多个请求。
 * - 会记录请求发起的顺序。
 * - 请求结果的排列顺序和请求的发起顺序不一定一致。
 * - 请求结果记录排序会存在两个方向。
 *
 * 典型应用场景
 * - 瀑布流加载
 */
export default class Waterfall extends Base {
    results: any[];
    errors: Array<Error | undefined>;
    states: State[];
    private resultStack;
    push(parameters: IParameters, options: IOptions): Promise<void>;
    unshift(parameters: IParameters, options: IOptions): Promise<void>;
    reload(index: number): Promise<void>;
    clear(): void;
    protected recordCreated(record: Record): void;
}
