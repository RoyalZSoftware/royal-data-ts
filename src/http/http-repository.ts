import { CrudRepository } from "../crud-repository";
import { Id } from "../id";
import { PersistedModel } from "../model-base";
import { CreateRepositoryOperation, DeleteRepositoryOperation, GetAllRepositoryOperation, GetDetailsRepositoryOperation, UpdateRepositoryOperation } from "../repository-operations";
import { HttpClient } from "./http-client";
import { map, Observable } from "rxjs";
import { Serializer } from "../serialization/serializer";

export type RouteFnWithModelId<ModelType> = (id: Id<ModelType>) => string;

export type SerializeFn<Input, Output> = (i: Input) => Output;

const DefaultIdKey = "id";

abstract class WithParseResponseToPersistedModel<ModelType> {
    constructor(protected _serializer: Serializer<ModelType>, protected _idKey: string = DefaultIdKey) { }
    public toPersistedModel(data: any) {
        const id = new Id<ModelType>((data as any)[this._idKey]);
        return new PersistedModel<ModelType>(id, this._serializer.deserialize(data));
    }
}

export class HttpCreateRepositoryOperation<ModelType extends {}>
    extends WithParseResponseToPersistedModel<ModelType>
    implements CreateRepositoryOperation<ModelType> {
    constructor(
        private _httpClient: HttpClient,
        private _endpoint: string,
        _serializer: Serializer<ModelType>,
        _idKey: string = DefaultIdKey,
    ) {
        super(_serializer, _idKey);
    }

    create(model: ModelType): Observable<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._endpoint, 'POST', this._serializer.serialize(model))
            .pipe(
                map(({ body }) => {
                    return this.toPersistedModel(body);
                })
            );
    }
}

export class HttpGetAllRepositoryOperation<ModelType extends {}, FilterType = {}>
    extends WithParseResponseToPersistedModel<ModelType>
    implements GetAllRepositoryOperation<ModelType, FilterType> {
    constructor(private _httpClient: HttpClient,
        private _endpoint: string,
        _serializer: Serializer<ModelType>,
        _idKey: string = DefaultIdKey,
    ) {
        super(_serializer, _idKey);
    }

    getAll(filter: Partial<FilterType>): Observable<PersistedModel<ModelType>[]> {

        return this._httpClient.send(this._endpoint, 'GET').pipe(
            map(({ body }) => {
                if (!Array.isArray(body))
                    throw new Error("No array returned");

                return body.map(item => {
                    return this.toPersistedModel(item);
                });
            })
        )
    }
}

export class HttpGetDetailsForRepositoryOperation<ModelType extends {}>
    extends WithParseResponseToPersistedModel<ModelType>
    implements GetDetailsRepositoryOperation<ModelType> {
    constructor(private _httpClient: HttpClient,
        private _endpoint: RouteFnWithModelId<ModelType>,
        _serializer: Serializer<ModelType>,
        _idKey: string = DefaultIdKey,
    ) {
        super(_serializer, _idKey);
    }

    getDetailsFor(id: Id<ModelType>): Observable<PersistedModel<ModelType> | undefined> {
        return this._httpClient.send(this._endpoint(id), 'GET').pipe(map(({ body }) => {
            return this.toPersistedModel(body);
        }));
    }
}

export class HttpUpdateRepositoryOperation<ModelType extends {}>
    extends WithParseResponseToPersistedModel<ModelType>
    implements UpdateRepositoryOperation<ModelType> {
    constructor(
        private _httpClient: HttpClient,
        private _endpoint: RouteFnWithModelId<ModelType>,
        _serializer: Serializer<ModelType>,
        _idKey: string = DefaultIdKey,
    ) {
        super(_serializer, _idKey);
    }
    update(id: Id<ModelType>, updatedModel: ModelType): Observable<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._endpoint(id), 'PUT', this._serializer.serialize(updatedModel)).pipe(
            map(({ body }) => {
                return this.toPersistedModel(body);
            })
        )
    }

}

export class HttpDeleteRepositoryOperation<ModelType extends {}> implements DeleteRepositoryOperation<ModelType> {
    constructor(private _httpClient: HttpClient, private _endpoint: RouteFnWithModelId<ModelType>) { }
    delete(id: Id<ModelType>): Observable<boolean> {
        return this._httpClient.send(this._endpoint(id), 'DELETE').pipe(
            map(({ status }) => {
                return status === 200;
            })
        )
    }
}

export type HttpRepositoryRouteDefinitions<ModelType> = {
    create: string;
    getAll: string;
    getDetailsFor: RouteFnWithModelId<ModelType>;
    update: RouteFnWithModelId<ModelType>;
    delete: RouteFnWithModelId<ModelType>;
};

export class HttpCrudRepository<ModelType extends {}, FilterType = {}> implements CrudRepository<ModelType, FilterType> {

    protected _createOperation: HttpCreateRepositoryOperation<ModelType>;
    protected _getDetailsForOperation: HttpGetDetailsForRepositoryOperation<ModelType>;
    protected _updateOperation: HttpUpdateRepositoryOperation<ModelType>;
    protected _deleteOperation: HttpDeleteRepositoryOperation<ModelType>;
    protected _getAllOperation: HttpGetAllRepositoryOperation<ModelType, FilterType>;

    constructor(
        protected _httpClient: HttpClient,
        protected _routeDefinitions: HttpRepositoryRouteDefinitions<ModelType>,
        protected _serializer: Serializer<ModelType>
    ) {
        this._createOperation = new HttpCreateRepositoryOperation<ModelType>(_httpClient,
            _routeDefinitions.create, this._serializer)
        this._getAllOperation = new HttpGetAllRepositoryOperation<ModelType, FilterType>(_httpClient, _routeDefinitions.getAll,
            this._serializer);
        this._getDetailsForOperation = new HttpGetDetailsForRepositoryOperation<ModelType>(_httpClient,
            _routeDefinitions.getDetailsFor,
            this._serializer);
        this._updateOperation = new HttpUpdateRepositoryOperation<ModelType>(_httpClient,
            _routeDefinitions.update,
            this._serializer);
        this._deleteOperation = new HttpDeleteRepositoryOperation<ModelType>(_httpClient,
            _routeDefinitions.delete);
    }
    create(model: ModelType): Observable<PersistedModel<ModelType>> {
        return this._createOperation.create(model);
    }
    getAll(filter: Partial<FilterType>): Observable<PersistedModel<ModelType>[]> {
        return this._getAllOperation.getAll(filter);
    }
    getDetailsFor(id: Id<ModelType>): Observable<PersistedModel<ModelType> | undefined> {
        return this._getDetailsForOperation.getDetailsFor(id);
    }
    update(id: Id<ModelType>, updatePayload: ModelType): Observable<PersistedModel<ModelType>> {
        return this._updateOperation.update(id, updatePayload);
    }
    delete(id: Id<ModelType>): Observable<boolean> {
        return this._deleteOperation.delete(id);
    }
}