import { firstValueFrom } from "rxjs";
import { HttpCrudRepositoryBuilder, Id } from "../../src"
import { Author, BlogPost } from "../models";
import { HttpSpy } from "./http-spy"

describe("GetAllRepositoryOperation Tests", () => {
    it("works", async () => {
        const fakedResponse = [
            {
                id: "0",
                title: "My first post",
                authorId: "1"
            },
            {
                id: "1",
                title: "My second post",
                authorId: "1"
            }
        ];
        const httpSpy = new HttpSpy({
            status: 200,
            body: JSON.stringify(fakedResponse),
        })
        const repository = new HttpCrudRepositoryBuilder(httpSpy, (data) => {
            return new BlogPost(new Id<Author>(data.authorId), data.title);
        }).withDefaultRouteDefinitions('posts').build();

        const models = await firstValueFrom(repository.getAll({}));
        expect(models.map(c => c.model.authorId.value).filter(c => c === undefined).length).toEqual(0);
    })
})