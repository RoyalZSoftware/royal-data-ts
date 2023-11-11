import { PersistedModel } from "../model-base";

export interface CreateRepositoryOperation<ModelType> {
    create(model: ModelType): Promise<PersistedModel<ModelType>>;
}