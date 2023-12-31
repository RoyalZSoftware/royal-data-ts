import { Observable } from "rxjs";
import { Id } from "../id";

export interface DeleteRepositoryOperation<ModelType> {
    delete(id: Id<ModelType>): Observable<boolean>;
}