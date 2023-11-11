import { CrudRepository } from "./crud-repository";
import { Id } from "./id";
import { PersistedModel } from "./model-base";

export interface StorageAdapter {
    setItems<T>(value: T[]): Promise<boolean>;
    getItems<T>(): Promise<PersistedModel<T>[]>;
}

export class InMemoryStorageAdapter implements StorageAdapter {
    public items: any[] = [];

    setItems<T>(value: T[]): Promise<boolean> {
        this.items = value;
        return Promise.resolve<boolean>(true);
    }
    getItems<T>(): Promise<PersistedModel<T>[]> {
        return Promise.resolve(this.items);
    }
}

export abstract class InMemoryCrudRepository<ModelType, FilterType> extends CrudRepository<ModelType, FilterType> {
    
    protected _items: PersistedModel<ModelType>[] = [];
    
    constructor(protected _storageAdapter: StorageAdapter) {
        super();
    }

    async loadFromStorageAdapter(): Promise<void> {
        return this._storageAdapter.getItems<ModelType>().then((result) => {
            this._items = result;
        });
    }

    create(model: ModelType): Promise<PersistedModel<ModelType>> {
        const createdItem = new PersistedModel(new Id<ModelType>(this._items.length.toString()), model);
        this._items.push(createdItem);

        this._storageAdapter.setItems(this._items);

        return Promise.resolve(createdItem);
    }

    update(id: Id<ModelType>, payload: ModelType): Promise<PersistedModel<ModelType>> {
        console.log(this._items);
        const itemIndex = this._items.findIndex(c => c.id.value == id.value);
        
        if (itemIndex === -1) throw new Error('Not found.');
        const updatedItem = {id: this._items[itemIndex].id, model: payload};

        this._items[itemIndex] = updatedItem;
        this._storageAdapter.setItems(this._items);

        return Promise.resolve(updatedItem);
    }

    getDetailsFor(id: Id<ModelType>): Promise<PersistedModel<ModelType> | undefined> {
        const item = this._items.find(c => c.id.value == id.value);

        return Promise.resolve(item);
    }

    getAll(filter: Partial<FilterType>): Promise<PersistedModel<ModelType>[]> {
        console.log("hallow lt", this._items);
        return Promise.resolve(this._items);
    }

    delete(id: Id<ModelType>): Promise<boolean> {
        const deletedItems = this._items.splice(this._items.findIndex(c => c.id.value === id.value), 1);

        this._storageAdapter.setItems(this._items);
        return Promise.resolve(deletedItems.length === 1);
    }
}