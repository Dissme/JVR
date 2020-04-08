type tag = string | object | component;
type component = (...args) => Root['$root'];
type props = object | null;
type children = (VitrualNode | string)[];

export interface VitrualNode {
    tag: tag;
    props: props;
    children: children;
    component: component;
    isVNode: {};
}

export interface Root {
    $root: JQuery<HTMLElement | DocumentFragment>;
    node: VitrualNode;
}
