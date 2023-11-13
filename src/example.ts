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