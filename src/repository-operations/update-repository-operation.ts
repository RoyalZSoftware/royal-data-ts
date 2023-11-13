import { Observable } from "rxjs";
import { Id } from "../id";
import { PersistedModel } from "../model-base";

export interface UpdateRepositoryOperation<ModelType> {
    update(id: Id<ModelType>, updatedModel: ModelType): Observable<PersistedModel<ModelType>>;
}