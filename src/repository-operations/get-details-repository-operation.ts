import { Observable } from "rxjs";
import { Id } from "../id";
import { PersistedModel } from "../model-base";

export interface GetDetailsRepositoryOperation<ModelType> {
    getDetailsFor(id: Id<ModelType>): Observable<PersistedModel<ModelType> | undefined>;
}