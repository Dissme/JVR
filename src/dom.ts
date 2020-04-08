import * as $ from 'jquery';
import { Root, VitrualNode } from './type';
import { bounce, debounce } from './utils';
import { Fragment, mount, diff } from '.';

export const isVNode = {};

export function createHtmlElement(
    tag: string | object = Fragment,
    props: VitrualNode['props'] = {}
): Root['$root'] {
    let $result: Root['$root'];
    if (tag === Fragment) {
        $result = $(document.createDocumentFragment());
        $result['isFragment'] = Fragment;
    }
    if (typeof tag === 'string') $result = $(`<${tag}></${tag}>`).attr(props);
    if (!$result) throw `未知的tag类型:${tag},创建DOM出错`;
    return $result;
}

export function render(
    component: VitrualNode['component'] | VitrualNode
): Root {
    if (typeof component === 'function') {
        component = {
            tag: component,
            props: {},
            children: [],
            component,
            isVNode,
        };
    }
    let node: VitrualNode, $root: Root['$root'];
    if (typeof component.tag === 'function') {
        $root = createHtmlElement();
        node = bounce(component.tag, component.props, component.children);
    } else {
        $root = createHtmlElement(component.tag, component.props);
        node = component;
    }
    return { $root, node };
}

export function append(
    $el: Root['$root'],
    component: VitrualNode['component'] | VitrualNode
): Root['$root'] {
    $el['effectDom'] = $el['effectDom'] || [];
    const { $root, node } = render(component);

    node.children.forEach((child): void => {
        if ((child as VitrualNode).isVNode === isVNode) {
            $el['effectDom'].push($root);
            mount($root, child as VitrualNode);
        } else {
            $el['effectDom'].push(child);
            $root.append(child + '');
        }
    });

    $el['eventPool'] = $el['eventPool'] || {};
    $el['eventPool']['propsChange'] =
        $el['eventPool']['propsChange'] || new Map();
    $el['eventPool']['propsChange'].set(
        $root,
        debounce((): void => {
            const effectDom = [...$el['effectDom']];
            const patches = diff({ $root, node }, component);
            patches.forEach((fn): void => fn($el, effectDom));
        })
    );
    // $el['vdom'] = node;
    $el.append($root);
    return $root;
}

export function remove(root: Root): Function {
    return function (): void {};
}

function insertAfter(current: Root['$root'] | string, target: Root): boolean {
    let result = false;
    if (current['isFragment'] === Fragment) {
        let len = current['effectDom'].length;
        while (len-- >= 0) {
            if (insertAfter(current['effectDom'][len], target)) return true;
        }
    } else if (typeof current !== 'string') {
        result = true;
        this.after(target.$root);
    }
    return result;
}

export function insert(root: Root): Function {
    return function (effectDom: Root[]): void {
        const targetEffectDom = this['effectDom'];
        if (targetEffectDom.indexOf(root) >= 0) return;
        let index = effectDom.indexOf(root),
            flag = false;
        if (index < 0) {
            flag = insertAfter.call(this, root);
        } else {
            let target: Root['$root'] | undefined;
            while (index++ < effectDom.length) {
                target = targetEffectDom.find(effectDom[index]);
                if (target) flag = insertAfter.call(target, root);
                if (flag) break;
            }
        }
        if (!flag) throw '未找到真实DOM节点,插入节点失败';
    };
}
