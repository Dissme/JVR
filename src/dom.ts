import Jvr, { JvrConstructor, JvrComponent } from './jvr';
import { bounce } from './utils';
import * as $ from 'jquery';
import Component from '.';

export const Fragment = Symbol('JvrEmptyTag');

type jvrTag = string | symbol | JvrConstructor;

export class JvrNode {
    public tag: jvrTag;
    public attr: null | object;
    public children: (JvrNode | string)[];
    public id: number;
    public eventPool: Record<string, Function> = {};

    public static counter: number = 0;

    public constructor(
        tag: jvrTag,
        attr: null | object,
        children: (JvrNode | string)[]
    ) {
        this.tag = tag;
        this.attr = attr;
        this.children = children;
        this.id = JvrNode.counter++;
        for (const key in attr) {
            if (attr.hasOwnProperty(key)) {
                const res = /^on-([a-z]+)$/.exec(key);
                const handler = attr[key];
                if (res && res[1]) {
                    this.eventPool[res[1]] = handler;
                }
            }
        }
    }
}

export function createElement(
    tag: jvrTag | Function,
    attr: null | object,
    ...children: (JvrNode | string)[]
): JvrNode {
    if (
        typeof tag === 'function' &&
        tag.prototype.isComponent !== JvrComponent
    ) {
        const bounceChildren = [];
        children.forEach((child): void => {
            if (child instanceof JvrNode) {
                bounceChildren.push(new Component(attr, [child]));
            }
            if (typeof child === 'string') {
                bounceChildren.push(child);
            }
        });
        return bounce(tag.bind(null, attr, bounceChildren));
    }
    return new JvrNode(tag as jvrTag, attr, children);
}

export function createDOM(
    tag: jvrTag,
    attr: object | null
): JQuery<HTMLElement | DocumentFragment> {
    let err = null,
        ele = null;
    switch (typeof tag) {
        case 'string':
            ele = $(`<${tag}></${tag}>`).attr(attr || {});
            break;
        // case 'function':
        //     if (tag.prototype.isComponent === JvrComponent) {
        //         ele = $(document.createDocumentFragment());
        //     } else {
        //         err = '试图实例化未定义的tag类型';
        //     }
        //     break;
        case 'symbol':
            if (tag === Fragment) {
                ele = $(document.createDocumentFragment());
            } else {
                err = '试图实例化未定义的tag类型';
            }
            break;
        default:
            err = '试图实例化未定义的tag类型';
            break;
    }
    if (err) throw err;
    return ele;
}

export function mount(
    root: JQuery.Selector | JQuery | HTMLElement | null,
    component: Jvr | JvrConstructor
): void {
    if (!root) root = 'body';
    const $root = $(root as JQuery.Selector);
    if (
        typeof component === 'function' &&
        component.prototype.isComponent === JvrComponent
    ) {
        component = new component(null, []);
    }
    component = component as Jvr;
    component.update();
    component.mount($root);
}
