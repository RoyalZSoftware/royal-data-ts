import { firstValueFrom } from 'rxjs';
import { HttpCreateRepositoryOperation, Id, JsonSerializationAdapter, PersistedModel } from '../../src';
import { CrudRepositoryBuilder } from '../../src/crud-repository-builder';
import { Author, BlogPost } from '../models';
import { HttpSpy } from './http-spy';

describe("CreateRepositoryOperation Tests", () => {
    it("Works with Json serializer", async () => {

        const data = {
            id: "0",
            title: 'Blog post 0',
            authorId: '0'
        };

        const httpSpy = new HttpSpy({
            status: 200,
            body: JSON.stringify(data),
        });
        const jsonSerializationAdapter = new JsonSerializationAdapter<BlogPost, {}>((i) => {
            return new BlogPost(new Id<Author>(i.authorId), i.title);
        });

        const createOperation = new HttpCreateRepositoryOperation<BlogPost>(httpSpy,
            '/posts',
            (i) => jsonSerializationAdapter.serializeModelToString(i),
            (i) => jsonSerializationAdapter.deserializeStringToPersistedModel(i)
        );

        const blogPost = new BlogPost(new Id<Author>('0'), 'Blog post 0');

        const persistedModel = await firstValueFrom(createOperation.create(blogPost));

        expect(httpSpy.sendSpy.url).toEqual('/posts');

        expect(persistedModel).toEqual(new PersistedModel(new Id<BlogPost>("0"), blogPost))
    });

    it("Use builder for easy access", async () => {
       const data = {
            id: "0",
            title: 'Blog post 0',
            authorId: '0'
        };

        const spy = new HttpSpy({
            status: 200, body: JSON.stringify(data)});

        const repository = new CrudRepositoryBuilder<BlogPost>()
            .http(
                spy,
                (data: any) => new BlogPost(new Id<Author>(data.authorId), data.title)
            )
            .withDefaultRouteDefinitions('posts').build();

        const details = await firstValueFrom(repository.getDetailsFor(new Id<BlogPost>("0")))

        expect(details!.model.authorId.value).toEqual("0")
    });
});