import { CreateRepositoryOperation } from "./repository-operations/create-repository-operation";
import { DeleteRepositoryOperation } from "./repository-operations/delete-repository-operation";
import { GetAllRepositoryOperation } from "./repository-operations/get-all-repository-operation";
import { GetDetailsRepositoryOperation } from "./repository-operations/get-details-repository-operation";
import { PersistedModel } from "./model-base";
import { Id } from "./id";
import { UpdateRepositoryOperation } from "./repository-operations/update-repository-operation";
import { Observable } from "rxjs";

export interface CrudRepository<ModelType, FilterType = {}> extends CreateRepositoryOperation<ModelType>, GetAllRepositoryOperation<ModelType, FilterType>, GetDetailsRepositoryOperation<ModelType>, UpdateRepositoryOperation<ModelType>, DeleteRepositoryOperation<ModelType> {
    create(model: ModelType): Observable<PersistedModel<ModelType>> 
    getAll(filter: Partial<FilterType>): Observable<PersistedModel<ModelType>[]> 
    getDetailsFor(id: Id<ModelType>): Observable<PersistedModel<ModelType> | undefined> 
    update(id: Id<ModelType>, updatePayload: ModelType): Observable<PersistedModel<ModelType>>
    delete(id: Id<ModelType>): Observable<boolean>
}