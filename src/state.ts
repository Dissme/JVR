import { mount } from '.';
import { Root } from './type';
class Observe<valueType> {
    private depencies: Root['$root'][] = [];
    private _value: valueType;
    public static runningDeps: Root['$root'][] = [];

    public constructor(initalValue: valueType) {
        this.value = initalValue;
    }

    public get value(): valueType {
        if (
            mount['currentEl'] &&
            this.depencies.indexOf(mount['currentEl']) < 0
        ) {
            this.depencies.push(mount['currentEl']);
        }
        return this._value;
    }

    public set value(nextValue: valueType) {
        if (this._value !== nextValue) {
            this._value = nextValue;
            this.depencies.forEach(($root: Root['$root']): void => {
                const map = $root['eventPool']['propsChange'];
                map.forEach((fn: Function, $target: Root['$root']): void => {
                    if (Observe.runningDeps.indexOf($target) >= 0) return;
                    fn();
                    Observe.runningDeps.push($target);
                });
                Observe.runningDeps = [];
            });
        }
    }
}

export function createState(initalStates: object): object {
    const target = {};
    for (const key in initalStates) {
        if (initalStates.hasOwnProperty(key)) {
            const value = initalStates[key];
            const observeValue = new Observe<typeof value>(value);
            target[key] = {
                get(): typeof value {
                    return observeValue.value;
                },
                set(nextValue: typeof value): void {
                    observeValue.value = nextValue;
                },
            };
        }
    }
    return Object.defineProperties({}, target);
}
