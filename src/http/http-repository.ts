import { CrudRepository } from "../crud-repository";
import { Id } from "../id";
import { PersistedModel } from "../model-base";
import { CreateRepositoryOperation, DeleteRepositoryOperation, GetAllRepositoryOperation, GetDetailsRepositoryOperation, UpdateRepositoryOperation } from "../repository-operations";
import { HttpClient } from "./http-client";
import { map, Observable } from "rxjs";

export type RouteFnWithModelId<ModelType> = (id: Id<ModelType>) => string;

export type SerializeFn<Input, Output> = (i: Input) => Output;

export class HttpCreateRepositoryOperation<ModelType extends {}> implements CreateRepositoryOperation<ModelType> {
    constructor(
        private _httpClient: HttpClient,
        private _endpoint: string,
        private _serializeModel: SerializeFn<ModelType, string>,
        private _deserializeModel: SerializeFn<string, PersistedModel<ModelType>>
    ) { }

    // modelType -> string
    // string -> PersistedModel

    create(model: ModelType): Observable<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._endpoint, 'POST', this._serializeModel(model))
            .pipe(
                map(({ body }) => {
                    return this._deserializeModel(body);
                })
            );
    }
}

export class HttpGetAllRepositoryOperation<ModelType extends {}, FilterType = {}> implements GetAllRepositoryOperation<ModelType, FilterType> {
    constructor(private _httpClient: HttpClient, private _endpoint: string,
        private _serializeFilter: SerializeFn<FilterType, string>,
        private _deserializeResponse: SerializeFn<string, PersistedModel<ModelType>[]>,
    ) { }
    // fitlerType -> string
    // string -> PersistedModel<T>

    getAll(filter: Partial<FilterType>): Observable<PersistedModel<ModelType>[]> {
        // TODO support filter

        return this._httpClient.send(this._endpoint, 'GET').pipe(
            map(({ body }) => {
                const models: PersistedModel<ModelType>[] = this._deserializeResponse(body);
                if (!Array.isArray(models)) throw new Error("No array returned");

                return models;
            })
        )
    }
}

export class HttpGetDetailsForRepositoryOperation<ModelType extends {}> implements GetDetailsRepositoryOperation<ModelType> {
    constructor(private _httpClient: HttpClient, private _endpoint: RouteFnWithModelId<ModelType>, private _deseriailzeResponse: SerializeFn<string, PersistedModel<ModelType> | undefined>) { }

    // nodata -> nodata
    // string -> PersistedModel<T>

    getDetailsFor(id: Id<ModelType>): Observable<PersistedModel<ModelType> | undefined> {
        return this._httpClient.send(this._endpoint(id), 'GET').pipe(map(({ body }) => {
            return this._deseriailzeResponse(body);
        }));
    }
}

export class HttpUpdateRepositoryOperation<ModelType extends {}> implements UpdateRepositoryOperation<ModelType> {
    // modelType -> string
    // string -> persistedModel
    constructor(private _httpClient: HttpClient, private _endpoint: RouteFnWithModelId<ModelType>, private _serializeModel: SerializeFn<ModelType, string>, private _deserializeModel: SerializeFn<string, PersistedModel<ModelType>>) { }
    update(id: Id<ModelType>, updatedModel: ModelType): Observable<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._endpoint(id), 'PUT', this._serializeModel(updatedModel)).pipe(
            map(({ body }) => this._deserializeModel(body))
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

export class JsonSerializationAdapter<ModelType, FilterType> {

    constructor(private _buildInstance: (data: any) => ModelType) { }

    public deserializeStringToPersistedModel(input: string): PersistedModel<ModelType> {
        const data = JSON.parse(input);

        if (!("id" in data)) {
            throw new Error("Could not deserialize");
        }

        const instance = this._buildInstance(data);

        return new PersistedModel(new Id<ModelType>(data.id), instance);
    }

    public serializeModelToString(input: ModelType) {
        return JSON.stringify(input);
    }

    public serializeFilterToString(input: FilterType) {
        return ""; // TODO
    }

    public deserializeArrayStringToPersistedModelArray(input: string) {
        const data = JSON.parse(input);

        if (!Array.isArray(data))
            throw new Error("Array expected for GetAllOperation");

        return data.map(model => {
            if (model.id === undefined) {
                throw new Error("Expected every model to have an id");
            }

            return new PersistedModel(new Id<ModelType>(model.id), this._buildInstance(model));
        })
    }
}

export type HttpRepositoryRouteDefinitions<ModelType> = {
    create: string;
    getAll: string;
    getDetailsFor: RouteFnWithModelId<ModelType>;
    update: RouteFnWithModelId<ModelType>;
    delete: RouteFnWithModelId<ModelType>;
};

export class HttpRepository<ModelType extends {}, FilterType = {}> implements CrudRepository<ModelType, FilterType> {

    protected _createOperation: HttpCreateRepositoryOperation<ModelType>;
    protected _getAllOperation: HttpGetAllRepositoryOperation<ModelType, FilterType>;
    protected _getDetailsForOperation: HttpGetDetailsForRepositoryOperation<ModelType>;
    protected _updateOperation: HttpUpdateRepositoryOperation<ModelType>;
    protected _deleteOperation: HttpDeleteRepositoryOperation<ModelType>;

    constructor(
        protected _httpClient: HttpClient,
        protected _routeDefinitions: HttpRepositoryRouteDefinitions<ModelType>,
        protected _serializationAdapter: JsonSerializationAdapter<ModelType, FilterType>,
    ) {
        this._createOperation = new HttpCreateRepositoryOperation<ModelType>(_httpClient,
            _routeDefinitions.create,
            (i) => this._serializationAdapter.serializeModelToString(i),
            (i) => this._serializationAdapter.deserializeStringToPersistedModel(i));
        this._getAllOperation = new HttpGetAllRepositoryOperation<ModelType, FilterType>(_httpClient, _routeDefinitions.getAll,
            (i) => this._serializationAdapter.serializeFilterToString(i),
            (i) => this._serializationAdapter.deserializeArrayStringToPersistedModelArray(i));
        this._getDetailsForOperation = new HttpGetDetailsForRepositoryOperation<ModelType>(_httpClient,
            (i) => _routeDefinitions.getDetailsFor(i),
            (i) => this._serializationAdapter.deserializeStringToPersistedModel(i));
        this._updateOperation = new HttpUpdateRepositoryOperation<ModelType>(_httpClient,
            _routeDefinitions.update,
            (i) => this._serializationAdapter.serializeModelToString(i),
            (i) => this._serializationAdapter.deserializeStringToPersistedModel(i));
        this._deleteOperation = new HttpDeleteRepositoryOperation<ModelType>(_httpClient,
            (i) => _routeDefinitions.delete(i));
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