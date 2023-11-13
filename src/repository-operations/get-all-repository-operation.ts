import { Observable } from "rxjs";
import { PersistedModel } from "../model-base";

export interface GetAllRepositoryOperation<ModelType, FilterType> {
    getAll(filter: Partial<FilterType>): Observable<PersistedModel<ModelType>[]>;
}