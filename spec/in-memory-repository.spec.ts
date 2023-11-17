import { firstValueFrom } from "rxjs";
import { Id, InMemoryCrudRepository, InMemoryStorageAdapter, PersistedModel, StorageAdapter } from "../src"
import { Author, BlogPost } from "./models";

class TestCaseBuilder<ModelType, FilterType = {}> {
    public readonly storageAdapter: StorageAdapter;
    public readonly repository: InMemoryCrudRepository<ModelType, FilterType>;

    constructor(public create: (i: number) => ModelType) {
        this.storageAdapter = new InMemoryStorageAdapter();
        this.repository = new InMemoryCrudRepository<ModelType, FilterType>(this.storageAdapter);
    }

    public async addItems(count: number) {
        for (let i = 0; i != count; i++) {
            await firstValueFrom(this.repository.create(this.create(i)));
        }

        return this;
    }

    public async first(): Promise<PersistedModel<ModelType>> {
        const items = await firstValueFrom(
            this.repository.getAll({})
        );

        return items[0];
    }
}

describe("InMemoryCrudRepository tests", () => {
    const buildBlogPost = (i: number) => {
        return new BlogPost(new Id<Author>("0"), "Blog post " + i);
    };

    it("Creating the inMemoryRepo works", () => {
        const repo = new InMemoryCrudRepository<BlogPost>(new InMemoryStorageAdapter());
    });

    it("Storing a model works", async () => {
        const storageAdapter = new InMemoryStorageAdapter();
        const repo = new InMemoryCrudRepository<BlogPost>(storageAdapter);

        const myFirstPost = new BlogPost(new Id<Author>("0"), "How to write tests 101");
        expect(storageAdapter.items.length).toEqual(0);

        const {id} = await firstValueFrom(repo.create(myFirstPost));

        expect(storageAdapter.items.length).toEqual(1);
        expect(id).toEqual(new Id<BlogPost>("0"));
    });

    it ("Retrieving stored models works", async () => {
        const storageAdapter = new InMemoryStorageAdapter();
        const repo = new InMemoryCrudRepository<BlogPost>(storageAdapter);
        const myFirstPost = new BlogPost(new Id<Author>("0"), "How to write tests 101");
        await firstValueFrom(repo.create(myFirstPost));

        const posts = await firstValueFrom(repo.getAll({}));

        expect(posts.length).toEqual(1);
    });

    it("Retrieving specific model works", async () => {
        const testCase = new TestCaseBuilder<BlogPost>(buildBlogPost);

        await testCase.addItems(1);
        
        const {id, model} = await testCase.first();

        expect((await firstValueFrom(testCase.repository.getDetailsFor(id)))?.model.title).toEqual("Blog post 0");
    })


    it("Updating a model works", async () => {
        const testCase = new TestCaseBuilder<BlogPost>(buildBlogPost);

        await testCase.addItems(1);
        
        const {id, model} = await testCase.first();

        expect(model.title).toEqual("Blog post 0")
        
        model.title = "Blog post 1000";

        testCase.repository.update(id, model);

        expect((await testCase.first()).model.title).toEqual("Blog post 1000");
    });

    it("Deleting a model works", async () => {
        const testCase = new TestCaseBuilder<BlogPost>(buildBlogPost);

        await testCase.addItems(1);
        
        const {id, model} = await testCase.first();

        expect((await firstValueFrom(testCase.repository.getAll({}))).length).toEqual(1);

        await firstValueFrom(testCase.repository.delete(id));

        expect((await firstValueFrom(testCase.repository.getAll({}))).length).toEqual(0);
    })
})