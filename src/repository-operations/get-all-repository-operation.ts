import { PersistedModel } from "../model-base";

export interface GetAllRepositoryOperation<ModelType, FilterType> {
    getAll(filter: Partial<FilterType>): Promise<PersistedModel<ModelType>[]>;
}