import { StorageAdapter } from "../in-memory-repository";
import { PersistedModel } from "../model-base";

export class LocalStorageStorageAdapter implements StorageAdapter {
    
    constructor(protected _key: string) { }

    setItems<T>(value: T[]): Promise<boolean> {
        localStorage.setItem(this._key, JSON.stringify(value));
        return Promise.resolve<boolean>(true);
    }
    getItems<T>(): Promise<PersistedModel<T>[]> {
        const stringFromLocalStorage = localStorage.getItem(this._key);
        return stringFromLocalStorage === null ? [] : JSON.parse(stringFromLocalStorage);
    }

}
