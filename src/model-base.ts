import { Id } from "./id";

export class PersistedModel<Model> {
    constructor(public readonly id: Id<Model>, public readonly model: Model) { }
}