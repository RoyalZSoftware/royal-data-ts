import { Observable } from "rxjs";
import { PersistedModel } from "../model-base";

export interface CreateRepositoryOperation<ModelType> {
    create(model: ModelType): Observable<PersistedModel<ModelType>>;
}