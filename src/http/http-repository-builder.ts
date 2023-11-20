import { HttpClient } from "./http-client";
import { JsonSerializationAdapter, HttpRepositoryRouteDefinitions, HttpCrudRepository, HttpGetAllRepositoryOperation } from "./http-repository";

export class HttpCrudRepositoryBuilder<ModelType extends {}, FilterType = {}> {
    private _serializationAdpater: JsonSerializationAdapter<ModelType, FilterType>;
    private _routeDefinitions: HttpRepositoryRouteDefinitions<ModelType> | undefined;

    constructor(private _httpClient: HttpClient, fn: (data: any) => ModelType) {
        this._serializationAdpater = new JsonSerializationAdapter<ModelType, FilterType>(fn);
    }

    public withDefaultRouteDefinitions(routePrefix: string): this {
        this._routeDefinitions = {
            create: routePrefix,
            delete: i => routePrefix + "/" + i.value,
            update: i => routePrefix + "/" + i.value,
            getDetailsFor: i => routePrefix + "/" + i.value,
            getAll: routePrefix,
        };

        return this;
    }

    public withCustomRouteDefinitions(routeDefinitions: HttpRepositoryRouteDefinitions<ModelType>): this {
        this._routeDefinitions = routeDefinitions;

        return this;
    }

    private _httpGetAllOperation?: HttpGetAllRepositoryOperation<ModelType, FilterType>;
    public withCustomQueryFunction(httpGetAllOperation: HttpGetAllRepositoryOperation<ModelType, FilterType>) {
        this._httpGetAllOperation = httpGetAllOperation;
    }

    public build(): HttpCrudRepository<ModelType, FilterType> {
        if (this._routeDefinitions === undefined) {
            throw new Error("Either use .withDefaultRouteDefinitions or .withCustomRouteDefinitions");
        }
        return new HttpCrudRepository(
            this._httpClient,
            this._routeDefinitions!,
            this._serializationAdpater,
            this._httpGetAllOperation
        )
    }
}
