import { EMPTY, Observable, Subscriber, map, of, tap } from "rxjs";
import { CrudRepository } from "./crud-repository";
import { Id } from "./id";
import { PersistedModel } from "./model-base";

export interface StorageAdapter {
    setItems<T>(value: T[]): Observable<boolean>;
    getItems<T>(): Observable<PersistedModel<T>[]>;
}

export class InMemoryStorageAdapter implements StorageAdapter {
    constructor(public items: any[] = []) {
    }

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
    
    constructor(protected _storageAdapter: StorageAdapter) {
        this.initialize().subscribe();
    }

    public initialize() {
        if (this._initialized) return EMPTY;
        return this._storageAdapter.getItems<ModelType>().pipe(
            tap((result: PersistedModel<ModelType>[]) => {
                this._items = [...result];
                this._initialized = true;
            })
        );
    }

    protected _nextIdFactory(): Id<ModelType> {
        return new Id<ModelType>(100000 + this._items.length.toString());
    }

    create(model: ModelType): Observable<PersistedModel<ModelType>> {
        return this.fromFunction$(() => {
            const createdItem = new PersistedModel(new Id<ModelType>(this._nextIdFactory().toString()), model);
            this._items.push(createdItem);
    
            this._storageAdapter.setItems(this._items);
    
            return createdItem;
        })
    }

    update(id: Id<ModelType>, payload: ModelType): Observable<PersistedModel<ModelType>> {
        return this.fromFunction$(() => {
            const itemIndex = this._items.findIndex(c => c.id.value == id.value);
        
            if (itemIndex === -1) throw new Error('Not found.');
            const updatedItem = {id: this._items[itemIndex].id, model: payload};
    
            this._items[itemIndex] = updatedItem;
            this._storageAdapter.setItems(this._items);
    
            return updatedItem;
        });
    }

    getDetailsFor(id: Id<ModelType>): Observable<PersistedModel<ModelType> | undefined> {
        return this.fromFunction$(() => {
            return this._items.find(c => c.id.value == id.value);
        })
    }

    getAll(filter: Partial<FilterType>): Observable<PersistedModel<ModelType>[]> {
        return this._initialized ? of([...this._items]) : this.initialize().pipe(map(() => this._items));
    }

    delete(id: Id<ModelType>): Observable<boolean> {
        return this.fromFunction$(() => {

            const deletedItems = this._items.splice(this._items.findIndex(c => c.id.value === id.value), 1);

            this._storageAdapter.setItems(this._items);
            return deletedItems.length === 1;
        });
    }

    private fromFunction$<T>(factory: () => T): Observable<T> {
        return Observable.create((observer: Subscriber<T>) => {
            try {
                observer.next(factory());
                observer.complete();
            } catch (error) {
                observer.error(error);
            }
        });
    }
}