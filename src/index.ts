import { Root, VitrualNode } from './type';
import {
    append,
    createHtmlElement,
    isVNode,
    render,
    remove,
    insert,
} from './dom';

export const Fragment = {};

export function diff(
    current: Root,
    component: VitrualNode['component'] | VitrualNode
): Function[] {
    const next = render(component);
    const patches = [];
    console.log(current, next);
    // todos: 各种情况的diff
    if (current.node.tag !== next.node.tag) {
        return [remove(current), insert(next)];
    }
    return patches;
}

export function mount(
    $el: Root['$root'],
    component: VitrualNode['component'] | VitrualNode
): Root['$root'] {
    const beforeEl = mount['currentEl'];
    mount['currentEl'] = $el;
    const $root = append($el, component);
    mount['currentEl'] = beforeEl;
    return $root;
}

export function createElement(
    tag: VitrualNode['tag'],
    props: VitrualNode['props'],
    ...children: VitrualNode['children'] | VitrualNode['children'][]
): VitrualNode {
    let component = createHtmlElement;
    if (typeof tag === 'function') component = tag as VitrualNode['component'];
    const resultChildren = [];
    function childrenIterator(
        children: VitrualNode['children'] | VitrualNode['children'][]
    ): void {
        children.forEach(
            (child: VitrualNode['children'] | VitrualNode | string): void => {
                if (child instanceof Array) return childrenIterator(child);
                resultChildren.push(child);
            }
        );
    }
    childrenIterator(children);
    return { tag, props, children: resultChildren, component, isVNode };
}
