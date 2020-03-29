import Jvr from './jvr';
import { createElement, JvrNode, Fragment } from './dom';

export default class Component extends Jvr {
    public static createElement = createElement;

    public render(): JvrNode {
        return createElement(Fragment, null);
    }
}
