# Royal Data TS
🚀 Define your models and this package will handle the persistence 

This package is a simple library using the power of repositories to unify data access to several different sources.

## Run the example in 4.738 seconds from now
```sh
$ cd /tmp && git clone https://github.com/royalzsoftware/royal-data-ts && cd royal-data-ts && npm install && npm run example
```

## Installation
#### npm
```bash
$ npm i @royalzsoftware/royal-data-ts
```

#### yarn
```bash
$ yarn add @royalzsoftware/royal-data-ts
```

## Example
```typescript
import { firstValueFrom } from "rxjs";
import { CrudRepository } from "./crud-repository";
import { CrudRepositoryBuilder } from "./crud-repository-builder";

// 0. create the user domain object
class User {
    private readonly permissions: string[] = [];

    constructor(public username: string, public password: string) { }

    addPermission(permission: string) {
        this.permissions.push(permission);
    }

    isAdminUser() {
        return this.permissions.includes('admin');
    }
}

// 1. inject the userRepository
async function test(userRepository: CrudRepository<User>) {
    // 2. create the user
    const user = new User("Alexander", "Panov");

    // 3. store the current user and retrieve newly created id
    const {id: userId} = await firstValueFrom(userRepository.create(user));

    // 4. add permission to the user
    user.addPermission('admin');

    // 5. update the user with the previously retrieved id and the user data
    const {model: updatedUser} = await firstValueFrom(userRepository.update(userId, user));

    // 6. print out if the admin is an admin user
    console.log(updatedUser.isAdminUser());
}

const repoBuilder = new CrudRepositoryBuilder<User>();

// 7. instantiate in memory repository
const userRepository = repoBuilder.inMemory();

// 8. or inject the http repository, by providing a http client.
const httpClient = undefined as any // YOUR JOB

const httpUserRepository = repoBuilder.http(httpClient, (userData: any) => {
    return new User(userData.username, userData.password);
}).withDefaultRouteDefinitions('/users');

// 9. run this shit
test(userRepository);
```

## 🌟 Highlights
- RxJs first
- `EventRepository` that holds the changes inMemory until you want to persist it by applying the events to a persisted CRUD Repository
- Zero dependencies besides Typescript
- Small modules that can be extended easily
- Shipped with `LocalStorage` adapter, for UI development without external depedencies
- Clear defined interfaces with low risk of wrong usage
- Ships with highly extensible `HTTP Repository`

## Releasing a new version
### Prerequisites
- Please do not have neither staged, nor unstaged changes, these will break the flow.
- You need to have make installed.
## Doing
- Rename the `UNRELEASED` section in the `CHANGELOG.md` file to following `DATE - SEMANTICVERSION` for example `2023-11-12 - 0.1.3`
- Then run `make`