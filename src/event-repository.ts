import { Observable, tap, zip } from "rxjs";
import { CrudRepository } from "./crud-repository";
import { Id } from "./id";
import { InMemoryCrudRepository, InMemoryStorageAdapter } from "./in-memory-repository";
import { PersistedModel } from "./model-base";

interface ItemEvent<T> {
  handle(repo: CrudRepository<T>): Observable<any>;
  affectedId(): Id<T>;
}

class CreateItemEvent<T> implements ItemEvent<T> {
  constructor(public readonly _id: Id<T>, private readonly _item: T) {}

  public affectedId(): Id<T> {
    return this._id;
  };

  handle(repo: CrudRepository<T>): Observable<any> {
    return repo.create(this._item);
  }
}

class DeleteItemEvent<T> implements ItemEvent<T> {
  constructor(private readonly _id: Id<T>) {}

  public affectedId(): Id<T> {
    return this._id;
  }

  handle(repo: CrudRepository<T>): Observable<any> {
    return repo.delete(this._id);
  }
}

class UpdateItemEvent<T> implements ItemEvent<T> {
  constructor(private readonly _id: Id<T>, private readonly _payload: T) { }

  affectedId(): Id<T> {
    return this._id;
  }

  handle(repo: CrudRepository<T, {}>): Observable<any> {
    return repo.update(this._id, this._payload);
  }
}

export class EventRepository<T, FilterType = {}> extends InMemoryCrudRepository<T, FilterType> {
  
  public events: ItemEvent<T>[] = [];

  constructor(sourceItems: PersistedModel<T>[] = []) {
    super(new InMemoryStorageAdapter(sourceItems));
  }

  create(model: T): Observable<PersistedModel<T>> {
    return super.create(model).pipe(
      tap((storedModel: PersistedModel<T>) => {
        this.events.push(new CreateItemEvent(storedModel.id, storedModel.model))
      })
    );
  }

  delete(id: Id<T>): Observable<boolean> {
    return super.delete(id).pipe(
      tap(() => {
        const affectedEvents = this._getAffectedEvents(id);
        
        if (affectedEvents.length > 0) {
          this.events = this.events.filter(c => !c.affectedId().isEqualTo(id));
          return;
        }

        this.events.push(new DeleteItemEvent(id))
      })
    );
  }

  private _getAffectedEvents(id: Id<T>): ItemEvent<T>[] {
    return this.events.filter(c => c.affectedId().isEqualTo(id));
  }

  update(id: Id<T>, payload: T): Observable<PersistedModel<T>> {
    return super.update(id, payload).pipe(
      tap(() => {
        this.events.push(new UpdateItemEvent(id, payload))
      })
    )
  }

  public applyTo(crudRepository: CrudRepository<T, FilterType>) {
    return zip(...this.events.map(c => c.handle(crudRepository))).pipe(tap(() => {
      this.events = [];
    }));
  }
}