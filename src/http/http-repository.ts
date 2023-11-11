import { CrudRepository } from "../crud-repository";
import { Id } from "../id";
import { PersistedModel } from "../model-base";
import { HttpClient } from "./http-client";

export type RouteFnWithModelId<ModelType> = (id: Id<ModelType>) => string;

export class JsonHttpApiClient implements HttpClient<object> {
    
    constructor(private _httpClient: HttpClient<string>) { }

    send(url: string, method: "POST" | "PUT" | "PATCH" | "GET" | "DELETE", headers?: { [key: string]: string; } | undefined): Promise<{ status: number; body: object; }> {
        return this._httpClient.send(url, method, {...headers, 'Content-type': 'application/json'}).then((response) => {
            return {...response, body: JSON.parse(response.body)};
        });
    }

    sendWithBody(url: string, method: "POST" | "PUT" | "PATCH", data: object, headers?: { [key: string]: string; } | undefined): Promise<{ status: number; body: object; }> {
        return this._httpClient.sendWithBody(url, method, JSON.stringify(data), {...headers, 'Content-type': 'application/json'}).then((response) => {
            return {...response, body: JSON.parse(response.body)};
        });
    }
}

export abstract class HttpRepository<ModelType, FilterType = {}> implements CrudRepository<ModelType, FilterType> {

    protected abstract _routeDefinitions: {
        create: string,
        getAll: string,
        getDetailsFor: RouteFnWithModelId<ModelType>,
        update: RouteFnWithModelId<ModelType>,
        delete: RouteFnWithModelId<ModelType>,
    }

    constructor(protected _httpClient: JsonHttpApiClient) { }

    create(model: ModelType): Promise<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._routeDefinitions.create, 'POST', model as object).then((result) => {
            return new PersistedModel<ModelType>((result.body as any).id, model)
        });
    }
    getAll(filter: Partial<FilterType>): Promise<PersistedModel<ModelType>[]> {
        return this._httpClient.send(this._routeDefinitions.getAll, 'GET').then((result) => {
            if (!Array.isArray(result.body)) throw new Error("No array returned");

            return result.body.map((item) => {
                return {
                    id: item.id,
                    model: item,
                } as PersistedModel<ModelType>;
            })
        });
    }
    getDetailsFor(id: Id<ModelType>): Promise<PersistedModel<ModelType> | undefined> {
        return this._httpClient.send(this._routeDefinitions.getDetailsFor(id), 'GET').then((result) => {
            return result.body == undefined ? undefined : new PersistedModel<ModelType>((result.body as any)?.id, result.body as any);
        });
    }
    update(id: Id<ModelType>, updatePayload: ModelType): Promise<PersistedModel<ModelType>> {
        return this._httpClient.sendWithBody(this._routeDefinitions.update(id), 'PUT', updatePayload as any).then((result: any) => {
            return new PersistedModel<ModelType>((result.body as any)?.id, result.body as any);
        });
    }
    delete(id: Id<ModelType>): Promise<boolean> {
        return this._httpClient.send(this._routeDefinitions.update(id), 'DELETE').then((result) => {
            return result.status == 200;
        });
    }

}