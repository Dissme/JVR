import * as $ from 'jquery';
import { JvrNode } from './dom';
import Jvr from './jvr';

export function nextFrame<T>(fn: (...args) => T): JQueryDeferred<T> {
    const defer = $.Deferred();
    requestAnimationFrame((): void => {
        try {
            const result: T = fn();
            defer.resolve(result);
        } catch (error) {
            defer.reject(error);
        }
    });
    return defer;
}

export function bounce(fn: Function): JvrNode {
    while ((fn = fn())) {
        if (typeof fn !== 'function') {
            return fn;
        }
    }
}

interface DiffType {
    type: string;
    id: string;
    params: object | null;
}

interface BatchMethods {
    [id: string]: DiffType[];
}

const diffMethods = {
    remove(id: string): JQuery {
        return (this as JQuery).find(`[${id}]`).remove();
    },
    insert(id: string, attr: object): JQuery {
        return (this as JQuery).append(
            $(`<${attr['tag']} ${id}></${attr['tag']}>`).attr(attr)
        );
    },
    move(id: string, params: object): JQuery {
        const index = params['index'];
        const $children = (this as JQuery).children();
        const $target = $children.find(`[${id}]`);
        if (index >= $children.length) {
            return $target.insertAfter($children.eq(-1));
        }
        return $target.insertBefore($children.eq(index));
    },
    setAttr(id: string, attr: object): JQuery {
        return (this as JQuery).find(`[${id}]`).attr(attr);
    },
};

export function diffCollector(context: JQuery, diffObj1: DiffType): Function {
    const pool: BatchMethods = { [diffObj1.id]: [{ ...diffObj1 }] };
    return function diffCollectorDo(
        diffObj2?: DiffType
    ): Function | JQueryDeferred<void> {
        if (!diffObj2 && diffObj2 + '' === 'undefined') {
            return nextFrame<void>((): void => {
                Object.keys(pool).forEach((id): void => {
                    const opts = pool[id];
                    while (opts.length) {
                        const opt = opts.shift();
                        // todos: 批量操作合并优化
                        diffMethods[opt.type].call(context, opt.id, opt.params);
                    }
                });
            });
        } else {
            pool[diffObj2.id] = pool[diffObj2.id] || [];
            pool[diffObj2.id].push(diffObj2);
        }
        return diffCollectorDo;
    };
}
