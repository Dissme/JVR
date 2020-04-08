import * as $ from 'jquery';
import { VitrualNode } from './type';

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

export function bounce(fn: Function, ...args): VitrualNode {
    while ((fn = fn(...args))) {
        if (typeof fn !== 'function') {
            // todos: 如果是个闭包高阶函数会增加diff损耗这里需要处理一下
            return fn;
        }
    }
}

export function debounce(fn: Function, timeout: number = 0): Function {
    let timer = null;
    return function (...args): void {
        if (timer) clearTimeout(timer);
        timer = setTimeout((): void => {
            fn.apply(this, args);
        }, timeout);
    };
}
