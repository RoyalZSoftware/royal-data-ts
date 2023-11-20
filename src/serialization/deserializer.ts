export interface Serializer<ModelT> {
    deserialize(modelData: any): ModelT;
    serialize(model: ModelT): any;
}
