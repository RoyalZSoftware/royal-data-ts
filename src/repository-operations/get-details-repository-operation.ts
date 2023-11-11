import { Id } from "../id";
import { PersistedModel } from "../model-base";

export interface GetDetailsRepositoryOperation<ModelType> {
    getDetailsFor(id: Id<ModelType>): Promise<PersistedModel<ModelType> | undefined>;
}