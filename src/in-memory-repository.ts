import { Observable, of } from "rxjs";
import { CrudRepository } from "./crud-repository";
import { Id } from "./id";
import { PersistedModel } from "./model-base";

export interface StorageAdapter {
    setItems<T>(value: T[]): Observable<boolean>;
    getItems<T>(): Observable<PersistedModel<T>[]>;
}

export class InMemoryStorageAdapter implements StorageAdapter {
    public items: any[] = [];

    setItems<T>(value: T[]): Observable<boolean> {
        this.items = value;
        return of<boolean>(true);
    }
    getItems<T>(): Observable<PersistedModel<T>[]> {
        return of(this.items);
    }
}

export class InMemoryCrudRepository<ModelType, FilterType = {}> implements CrudRepository<ModelType, FilterType> {
    
    protected _items: PersistedModel<ModelType>[] = [];
    private _initialized: boolean = false;
    
    constructor(protected _storageAdapter: StorageAdapter) { }

    create(model: ModelType): Observable<PersistedModel<ModelType>> {
        const createdItem = new PersistedModel(new Id<ModelType>(this._items.length.toString()), model);
        this._items.push(createdItem);

        this._storageAdapter.setItems(this._items);

        return of(createdItem);
    }

    update(id: Id<ModelType>, payload: ModelType): Observable<PersistedModel<ModelType>> {
        const itemIndex = this._items.findIndex(c => c.id.value == id.value);
        
        if (itemIndex === -1) throw new Error('Not found.');
        const updatedItem = {id: this._items[itemIndex].id, model: payload};

        this._items[itemIndex] = updatedItem;
        this._storageAdapter.setItems(this._items);

        return of(updatedItem);
    }

    getDetailsFor(id: Id<ModelType>): Observable<PersistedModel<ModelType> | undefined> {
        const item = this._items.find(c => c.id.value == id.value);

        return of(item);
    }

    getAll(filter: Partial<FilterType>): Observable<PersistedModel<ModelType>[]> {
        return of(this._items);
    }

    delete(id: Id<ModelType>): Observable<boolean> {
        const deletedItems = this._items.splice(this._items.findIndex(c => c.id.value === id.value), 1);

        this._storageAdapter.setItems(this._items);
        return of(deletedItems.length === 1);
    }
}