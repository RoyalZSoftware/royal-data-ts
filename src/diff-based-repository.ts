import { Observable, take, tap, zip, switchMap } from "rxjs";
import { CrudRepository } from "./crud-repository";
import { Id } from "./id";
import { InMemoryCrudRepository, InMemoryStorageAdapter } from "./in-memory-repository";
import { PersistedModel } from "./model-base";

abstract class ItemEvent<T> {
    abstract handle(repo: CrudRepository<T>): Observable<any>;
    protected constructor(public readonly itemId: Id<T>) { }
  }
  
  class CreateItemEvent<T> extends ItemEvent<T> {
    constructor(public readonly myItem: PersistedModel<T>) {
      super(myItem.id);
    }
    override handle(repo: CrudRepository<T>): Observable<any> {
      return repo.create(this.myItem.model);
    }
  }
  
  class DeleteItemEvent<T> extends ItemEvent<T> {
    constructor(item: Id<T>) {
      super(item);
    }
  
    handle(repo: CrudRepository<T>): Observable<any> {
      console.log("Deleting item " + this.itemId);
      return repo.delete(this.itemId);
    }
  }
  
export class NotifyAboutChangesOnCrudRepository<ModelType, FilterType = {}> implements CrudRepository<any> {
  
    public events: ItemEvent<ModelType>[] = [];
  
    private _inMemory: InMemoryCrudRepository<any> = new InMemoryCrudRepository(new InMemoryStorageAdapter());
  
    constructor(private _commitToCrudRepo: CrudRepository<ModelType, FilterType>) {

    }
  
    public initialize(): Observable<any> {
      return this._commitToCrudRepo.getAll({}).pipe(take(1), tap((items) => {
        const inMemoryStorage = new InMemoryStorageAdapter();
        inMemoryStorage.items = [...items];
        this._inMemory = new InMemoryCrudRepository<ModelType>(inMemoryStorage);
      }))
    }
  
    create(model: ModelType): Observable<PersistedModel<any>> {
      return this._inMemory.create(model).pipe(tap((persistedModel) => {
        this.events.push(
          new CreateItemEvent(persistedModel)
        );
      }))
    }
  
    delete(id: Id<ModelType>): Observable<boolean> {
      return this._inMemory.delete(id).pipe(
        tap(() => {
  
          const foundEvents = this._getExistingEventsFor(id);
          const indexOfCreationEvent = foundEvents.findIndex(c => c instanceof CreateItemEvent)
  
          if (indexOfCreationEvent !== -1) {
            this.events = this.events.splice(indexOfCreationEvent, 1);
            // The item was created previously, so we do not need to notify somebody about it
            return;
          }
  
          this.events.push(
            new DeleteItemEvent(id),
          )
        })
      );
    }
  
    private _getExistingEventsFor(id: Id<ModelType>) {
      return this.events.filter(c => c.itemId.value == id.value);
    }
  
    getAll(filter: Partial<{}>): Observable<PersistedModel<any>[]> {
      return this._inMemory.getAll(filter);
    }
  
    getDetailsFor(id: Id<any>): Observable<PersistedModel<any> | undefined> {
      return this._inMemory.getDetailsFor(id);
    }
  
    update(id: Id<any>, updatePayload: any): Observable<PersistedModel<any>> {
      return this._inMemory.update(id, updatePayload);
    }
  
    public executeAll(): Observable<any> {
      return zip(...this.events.map(c => c.handle(this._commitToCrudRepo))).pipe(tap(() => {
          this.events = [];
        }),
        switchMap(() => this.initialize())
      );
    }
  }
  