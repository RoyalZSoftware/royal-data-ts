import { HttpClient } from "./http";
import { HttpCrudRepositoryBuilder } from "./http/http-repository-builder";
import { InMemoryCrudRepository, InMemoryStorageAdapter, StorageAdapter } from "./in-memory-repository";

export class CrudRepositoryBuilder<ModelType extends {}, FilterType = {}> {

    public http(httpClient: HttpClient, deserializationFn: (data: any) => ModelType): HttpCrudRepositoryBuilder<ModelType, FilterType> {
        return new HttpCrudRepositoryBuilder(httpClient, deserializationFn);
    }

    public inMemory(storageAdapter?: StorageAdapter) {
        return new InMemoryCrudRepository(storageAdapter ?? new InMemoryStorageAdapter());
    }
}