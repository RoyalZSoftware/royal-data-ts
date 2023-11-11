import { Id } from "../id";

export interface DeleteRepositoryOperation<ModelType> {
    delete(id: Id<ModelType>): Promise<boolean>;
}