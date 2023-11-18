export class Id<T> {
    constructor(public value: string) {}

    public isEqualTo(id: Id<T>) {
        return id.value == this.value;
    }
}