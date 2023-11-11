import { CreateRepositoryOperation } from "./repository-operations/create-repository-operation";
import { DeleteRepositoryOperation } from "./repository-operations/delete-repository-operation";
import { GetAllRepositoryOperation } from "./repository-operations/get-all-repository-operation";
import { GetDetailsRepositoryOperation } from "./repository-operations/get-details-repository-operation";
import { PersistedModel } from "./model-base";
import { Id } from "./id";
import { UpdateRepositoryOperation } from "./repository-operations/update-repository-operation";

export abstract class CrudRepository<ModelType, FilterType = {}> implements CreateRepositoryOperation<ModelType>, GetAllRepositoryOperation<ModelType, FilterType>, GetDetailsRepositoryOperation<ModelType>, UpdateRepositoryOperation<ModelType>, DeleteRepositoryOperation<ModelType> {
    abstract create(model: ModelType): Promise<PersistedModel<ModelType>> 
    abstract getAll(filter: Partial<FilterType>): Promise<PersistedModel<ModelType>[]> 
    abstract getDetailsFor(id: Id<ModelType>): Promise<PersistedModel<ModelType> | undefined> 
    abstract update(id: Id<ModelType>, updatePayload: ModelType): Promise<PersistedModel<ModelType>>
    abstract delete(id: Id<ModelType>): Promise<boolean>
}