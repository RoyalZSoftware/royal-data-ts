import { Id } from "../src";

export class Author {
    constructor(public firstName: string, public lastName: string) {

    }
}

export class BlogPost {
    constructor(public authorId: Id<Author>, public title: string) {
    }
}