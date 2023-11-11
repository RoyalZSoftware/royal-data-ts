# Royal Data TS

🚀 This package is a simple library using the power of repositories to unify data access to several different sources.

## Running the example
```sh
$ cd /tmp && git clone https://github.com/royalzsoftware/royal-data-ts && cd royal-data-ts && npm install && npm run example
```

## Example
```typescript
import { CrudRepository } from "./crud-repository";
import { InMemoryCrudRepository, InMemoryStorageAdapter } from "./in-memory-repository";
import { PersistedModel } from "./model-base";

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

// 1. create the user repository (since it supports more than just CRUD endpoints)
interface UserRepository extends CrudRepository<User, {}> {
    me(): Promise<PersistedModel<User>>;
}

// 2. create the in memory implementation for further operations
class InMemoryUserRepository extends InMemoryCrudRepository<User, {}> implements UserRepository {
    me(): Promise<PersistedModel<User>> {
        return Promise.resolve<PersistedModel<User>>(this._items[0]!);
    }
}

// 3. inject the userRepository
async function test(userRepository: UserRepository) {
    // 4. create the user
    const user = new User("Alexander", "Panov");

    // 5. store the current user and retrieve newly created id
    const {id: userId} = await userRepository.create(user);

    // 6. add permission to the user
    user.addPermission('admin');

    // 7. update the user with the previously retrieved id and the user data
    const {model: updatedUser} = await userRepository.update(userId, user);

    // 8. print out if the admin is an admin user
    console.log(updatedUser.isAdminUser());
}

// 9. instanciate repository
const userRepository = new InMemoryUserRepository(
    new InMemoryStorageAdapter()
);

// 9. run this shit
test(userRepository);
```

## 🌟 Highlights
- Promise based
- Zero dependencies besides Typescript
- Small modules that can be extended easily
- Shipped with `LocalStorage` adapter, for UI development without external depedencies
- Clear defined interfaces with low risk of wrong usage
- Ships with highly extensible `HTTP Repository`

