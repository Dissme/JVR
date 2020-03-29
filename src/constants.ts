const initalFlag = 1;
export enum COMPONENT_STATUS {
    initialized = initalFlag << 0,
    mounted = initalFlag << 1,
}
