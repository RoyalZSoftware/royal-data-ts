import { CrudRepository } from "../crud-repository";
import { Id } from "../id";
import { PersistedModel } from "../model-base";
import { CreateRepositoryOperation, DeleteRepositoryOperation, GetAllRepositoryOperation, GetDetailsRepositoryOperation, UpdateRepositoryOperation } from "../repository-operations";
import { HttpClient } from "./http-client";

export type RouteFnWithModelId<ModelType> = (id: Id<ModelType>) => string;

export class JsonHttpApiClient implements HttpClient<object> {

    constructor(private _httpClient: HttpClient<string>) { }

    send(url: string, method: "POST" | "PUT" | "PATCH" | "GET" | "DELETE", headers?: { [key: string]: string; } | undefined): Promise<{ status: number; body: object; }> {
        return this._httpClient.send(url, method, { ...headers, 'Content-type': 'application/json' }).then((response) => {
            return { ...response, body: JSON.parse(response.body) };
        });
    }

    sendWithBody(url: string, method: "POST" | "PUT" | "PATCH", data: object, headers?: { [key: string]: string; } | undefined): Promise<{ status: number; body: object; }> {
        return this._httpClient.sendWithBody(url, method, JSON.stringify(data), { ...headers, 'Content-type': 'application/json' }).then((response) => {
            return { ...response, body: JSON.parse(response.body) };
        });
    }
}

export class HttpCreateRepositoryOperation<ModelType extends {}> implements CreateRepositoryOperation<ModelType> {
    constructor(private _httpClient: JsonHttpApiClient, private _endpoint: string) { }

    create(model: ModelType): Promise<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._endpoint, 'POST', model).then((result) => {
            return new PersistedModel<ModelType>((result.body as any).id, model)
        });
    }
}

export class HttpGetAllRepositoryOperation<ModelType extends {}, FilterType = {}> implements GetAllRepositoryOperation<ModelType, FilterType> {
    constructor(private _httpClient: JsonHttpApiClient, private _endpoint: string) { }
    getAll(filter: Partial<FilterType>): Promise<PersistedModel<ModelType>[]> {
        return this._httpClient.send(this._endpoint, 'GET').then((result) => {
            if (!Array.isArray(result.body)) throw new Error("No array returned");

            return result.body.map((item) => {
                return {
                    id: item.id,
                    model: item,
                } as PersistedModel<ModelType>;
            })
        });
    }
}

export class HttpGetDetailsForRepositoryOperation<ModelType extends {}> implements GetDetailsRepositoryOperation<ModelType> {
    constructor(private _httpClient: JsonHttpApiClient, private _endpoint: RouteFnWithModelId<ModelType>) { }
    getDetailsFor(id: Id<ModelType>): Promise<PersistedModel<ModelType> | undefined> {
        return this._httpClient.send(this._endpoint(id), 'GET').then((result) => {
            return result.body == undefined ? undefined : new PersistedModel<ModelType>((result.body as any)?.id, result.body as any);
        });
    }
}

export class HttpUpdateRepositoryOperation<ModelType extends {}> implements UpdateRepositoryOperation<ModelType> {
    constructor(private _httpClient: JsonHttpApiClient, private _endpoint: RouteFnWithModelId<ModelType>) { }
    update(id: Id<ModelType>, updatedModel: ModelType): Promise<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._endpoint(id), 'PUT', updatedModel as any).then((result: any) => {
            return new PersistedModel<ModelType>((result.body as any)?.id, result.body as any);
        });
    }

}

export class HttpDeleteRepositoryOperation<ModelType extends {}> implements DeleteRepositoryOperation<ModelType> {
    constructor(private _httpClient: JsonHttpApiClient, private _endpoint: RouteFnWithModelId<ModelType>) { }
    delete(id: Id<ModelType>): Promise<boolean> {
        return this._httpClient.send(this._endpoint(id), 'DELETE').then((result) => {
            return result.status == 200;
        });
    }

}
export class HttpRepository<ModelType extends {}, FilterType = {}> implements CrudRepository<ModelType, FilterType> {

    protected _createOperation: HttpCreateRepositoryOperation<ModelType>;
    protected _getAllOperation: HttpGetAllRepositoryOperation<ModelType, FilterType>;
    protected _getDetailsForOperation: HttpGetDetailsForRepositoryOperation<ModelType>;
    protected _updateOperation: HttpUpdateRepositoryOperation<ModelType>;
    protected _deleteOperation: HttpDeleteRepositoryOperation<ModelType>;

    constructor(
        protected _httpClient: JsonHttpApiClient,
        protected _routeDefinitions: {
            create: string,
            getAll: string,
            getDetailsFor: RouteFnWithModelId<ModelType>,
            update: RouteFnWithModelId<ModelType>,
            delete: RouteFnWithModelId<ModelType>,
        }
    ) {
        this._createOperation = new HttpCreateRepositoryOperation<ModelType>(_httpClient, _routeDefinitions.create);
        this._getAllOperation = new HttpGetAllRepositoryOperation<ModelType>(_httpClient, _routeDefinitions.getAll);
        this._getDetailsForOperation = new HttpGetDetailsForRepositoryOperation<ModelType>(_httpClient, _routeDefinitions.getDetailsFor);
        this._updateOperation = new HttpUpdateRepositoryOperation<ModelType>(_httpClient, _routeDefinitions.update);
        this._deleteOperation = new HttpDeleteRepositoryOperation<ModelType>(_httpClient, _routeDefinitions.delete);
    }
    create(model: ModelType): Promise<PersistedModel<ModelType>> {
        return this._createOperation.create(model);
    }
    getAll(filter: Partial<FilterType>): Promise<PersistedModel<ModelType>[]> {
        return this._getAllOperation.getAll(filter);
    }
    getDetailsFor(id: Id<ModelType>): Promise<PersistedModel<ModelType> | undefined> {
        return this._getDetailsForOperation.getDetailsFor(id);
    }
    update(id: Id<ModelType>, updatePayload: ModelType): Promise<PersistedModel<ModelType>> {
        return this._updateOperation.update(id, updatePayload);
    }
    delete(id: Id<ModelType>): Promise<boolean> {
        return this._deleteOperation.delete(id);
    }

}