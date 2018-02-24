import Base from './Base';
import IParameters from './IParameters';
import IOptions from './IOptions';
import Record, {State} from './Record';
import {get, includes} from 'lodash';

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
    public results: any[] = [];

    public errors: Array<Error | undefined> = [];

    public states: State[] = [];

    private resultStack: Record[] = [];

    public async push(parameters: IParameters, options: IOptions): Promise<void> {
        options.direction = 'DOWN';
        return this.send(parameters, options);
    }

    public async unshift(parameters: IParameters, options: IOptions): Promise<void> {
        options.direction = 'UP';
        return this.send(parameters, options);
    }

    // 重新加载某块数据
    public async reload(index: number): Promise<void> {
        const prevRecord = this.resultStack[index];
        if (!prevRecord) {
            throw new Error('No such record index.');
        }
        await this.send(
            prevRecord.getParameters() || {},
            {
                ...prevRecord.getOptions(),
                direction: 'RELOAD',
                reloadIndex: index,
            },
        );
    }

    public clear() {
        this.results = [];
        this.errors = [];
        this.states = [];
        this.resultStack = [];
        this.stack = [];
    }

    protected recordCreated(record: Record): void {
        super.recordCreated(record);

        const primaryDirection = get(record.getOptions(), 'direction', 'DOWN');
        const direction: 'UP' | 'DOWN' | 'RELOAD' = includes(['UP', 'DOWN', 'RELOAD'], primaryDirection)
            ? primaryDirection : 'DOWN';

        let index: number;
        if (direction === 'UP') {
            index = 0;
            this.resultStack.unshift(record);
        } else if (direction === 'DOWN') {
            index = this.resultStack.length;
            this.resultStack.push(record);
        } else {
            const reloadIndex = get(record.getOptions(), 'reloadIndex');
            if (typeof reloadIndex !== 'number') {
                throw new Error('No reloadIndex.');
            }
            index = reloadIndex;
            this.resultStack[index] = record;
        }

        record.on('statechange', () => {
            const state = record.getState();
            if (!includes(['LOADING', 'READY'], state)) {
                this.results[index] = record.getResult();
                this.errors[index] = record.getError();
                this.states[index] = record.getState();
            }
        });
    }
}
