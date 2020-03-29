import Jvr from './jvr';

class Observe<valueType> {
    public static runtimeComponent: Jvr | null = null;
    private depencies: Jvr[] = [];
    private _value: valueType;

    public constructor(initalValue: valueType) {
        this.value = initalValue;
    }

    public get value(): valueType {
        if (
            Observe.runtimeComponent &&
            this.depencies.indexOf(Observe.runtimeComponent) < 0
        ) {
            this.depencies.push(Observe.runtimeComponent);
        }
        return this._value;
    }

    public set value(nextValue: valueType) {
        if (this._value !== nextValue) {
            this._value = nextValue;
            this.depencies.forEach((component: Jvr): void => {
                component.update();
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

interface JvrStateComponent extends Jvr {
    $state: object;
}

export function mapState(
    component: Jvr,
    state: object,
    fn: (state: object) => object
): JvrStateComponent {
    Observe.runtimeComponent = component;
    Object.defineProperty(component, '$state', {
        get(): object {
            return fn(state);
        },
    });
    Observe.runtimeComponent = null;
    return component as JvrStateComponent;
}
