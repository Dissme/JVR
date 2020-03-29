import { JvrNode, Fragment, createDOM } from './dom';
import * as $ from 'jquery';
import { COMPONENT_STATUS } from './constants';

type attr = object | null;
type children = (Jvr | JvrNode | string)[];
type root = JQuery | Jvr | null;

export interface JvrConstructor {
    new (attr: attr, children: children, root?: root): Jvr;
}

export const JvrComponent = Symbol('JvrComponent');

abstract class Jvr {
    private status: number = 0;
    private root: root = null;
    private attr: attr = null;
    private vitrualDOM: JvrNode | Jvr | null = null;
    private realDOM: JQuery<HTMLElement | DocumentFragment> | null = null;

    protected children: children = [];

    public constructor(attr: attr, children: children, root?: Jvr | JQuery) {
        this.attr = attr;
        this.children = children;
        this.root = root;
    }

    private hasStatus(name: string): boolean {
        return (
            (this.status & COMPONENT_STATUS[name]) === COMPONENT_STATUS[name]
        );
    }

    private addStatus(name: string): void {
        this.status = this.status | COMPONENT_STATUS[name];
    }

    private removeStatus(name: string): void {
        if (this.hasStatus(name))
            this.status = this.status ^ COMPONENT_STATUS[name];
    }

    public get isComponent(): symbol {
        return JvrComponent;
    }

    public update(): void {
        const nextNode = this.render();
        if (!this.hasStatus('initialized') || this.shouldUpdate(nextNode))
            this.diff(nextNode);
    }

    public diff(nextNode: JvrNode): void {
        const currentNode = this.vitrualDOM;
        if (!currentNode) {
            if (this.hasStatus('mounted')) {
                console.error('虚拟DOM数据丢失');
                this.unMount();
            }
            if (typeof nextNode.tag === 'function') {
                if (nextNode.tag.prototype.isComponent) {
                    this.vitrualDOM = new nextNode.tag(
                        nextNode.attr,
                        nextNode.children,
                        this
                    );
                    this.realDOM = createDOM(Fragment, null);
                } else {
                    console.error('实例化组件失败', nextNode);
                }
            } else {
                this.vitrualDOM = nextNode;
                this.realDOM = createDOM(nextNode.tag, nextNode.attr);
            }
        } else {
            if (this.vitrualDOM instanceof Jvr) {
                // todos: 组件实例类型diff
            }
            if (this.vitrualDOM instanceof JvrNode) {
                // todos: 虚拟DOM类型diff
            }
        }
        // todos: childrendiff
        console.log(nextNode, this.vitrualDOM);
    }

    public mount(root?: JQuery | Jvr): void {
        if (this.hasStatus('mounted')) this.unMount();
        if (!this.hasStatus('initialized')) {
            this.update();
            this.addStatus('initialized');
        }
        if (!root) root = this.root || $('body');
    }

    public unMount(): void {
        if (!this.hasStatus('mounted')) return;
        if (this.realDOM) {
            this.realDOM.remove();
        }
        this.removeStatus('mounted');
    }

    public shouldUpdate(nextNode: JvrNode): boolean {
        if (this.vitrualDOM === nextNode) return false;
        return true;
    }

    abstract render(): JvrNode;
}

export default Jvr;
