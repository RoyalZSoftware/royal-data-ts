import { Observable, of } from "rxjs";
import { StorageAdapter } from "../in-memory-repository";
import { PersistedModel } from "../model-base";

export class LocalStorageStorageAdapter implements StorageAdapter {
    
    constructor(protected _key: string) { }

    setItems<T>(value: T[]): Observable<boolean> {
        localStorage.setItem(this._key, JSON.stringify(value));
        return of(true);
    }
    getItems<T>(): Observable<PersistedModel<T>[]> {
        const data = localStorage.getItem(this._key)
        
        return of(data === null ? [] : JSON.parse(data));
    }

}
