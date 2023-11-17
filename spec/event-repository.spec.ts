import { firstValueFrom } from "rxjs";
import { EventRepository, Id, InMemoryCrudRepository, InMemoryStorageAdapter, PersistedModel } from "../src";

class Post {
  constructor(public name: string, public author: string) {}
}

describe("EventBasedRepository", () => {
    it("creating works", async () => {
        const persistedRepository = new InMemoryCrudRepository<Post>(new InMemoryStorageAdapter([
            new PersistedModel(new Id<Post>("0"), new Post("My first post", "Alexander Panov")),
            new PersistedModel(new Id<Post>("1"), new Post("My second post", "Alexander Panov")),
        ]));

        const items = await firstValueFrom(persistedRepository.getAll({}));

        const eventBasedRepository = new EventRepository(items);

        const result = await firstValueFrom(eventBasedRepository.create(
            new Post('My third post', 'Alexander Panov')
        ));

        await firstValueFrom(eventBasedRepository.applyTo(persistedRepository));

        const resultAfter = await firstValueFrom(persistedRepository.getAll({}));

        expect(resultAfter.length).toEqual(3);
    });
    it("deleting works", async () => {
        const persistedRepository = new InMemoryCrudRepository<Post>(new InMemoryStorageAdapter([
            new PersistedModel(new Id<Post>("0"), new Post("My first post", "Alexander Panov")),
            new PersistedModel(new Id<Post>("1"), new Post("My second post", "Alexander Panov")),
        ]));

        const items = await firstValueFrom(persistedRepository.getAll({}));

        const eventBasedRepository = new EventRepository(items);

        await firstValueFrom(eventBasedRepository.delete(new Id<Post>("0")));

        await firstValueFrom(eventBasedRepository.applyTo(persistedRepository));

        const resultAfter = await firstValueFrom(persistedRepository.getAll({}));
        expect(resultAfter.length).toEqual(1);
    });
    it("Deleting the first one, creating another and updating it works", async () => {
        const persistedRepository = new InMemoryCrudRepository<Post>(new InMemoryStorageAdapter([
            new PersistedModel(new Id<Post>("0"), new Post("My first post", "Alexander Panov")),
            new PersistedModel(new Id<Post>("1"), new Post("My second post", "Alexander Panov")),
        ]));

        const items = await firstValueFrom(persistedRepository.getAll({}));

        const eventBasedRepository = new EventRepository(items);

        await firstValueFrom(eventBasedRepository.delete(new Id<Post>("0")));
        const x = await firstValueFrom(eventBasedRepository.create(new Post("My third post", "Alexander Panov")));

        await firstValueFrom(eventBasedRepository.update(x.id, new Post("Another post", "Alexander Panov")));

        await firstValueFrom(eventBasedRepository.applyTo(persistedRepository));

        const resultAfter = await firstValueFrom(persistedRepository.getAll({}));
        expect(resultAfter[1].model.name).toEqual("Another post");
        expect(resultAfter.length).toEqual(2);
    })
})
