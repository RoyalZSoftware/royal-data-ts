# Changelog

## Unreleased
### Breaking changes
- http repository now takes an serializer object

## 2023-11-20 - 0.4.1
### Fixes
- Create model for inMemory now has the correct implementation

## 2023-11-18 - 0.4.0
### Features
- `Id<T>` has now an `isEqualTo(id: Id<T>)` method
### Fixes
- `EventRepository` works now correctly when creating a new item in memory and removing it without first persisting it.
- `InMemoryRepository` creates the next id now with a prefix of 100k.
### Chores
- Give the EventRepository a stage in the readme

## 2023-11-18 - 0.3.0
### Features
- `EventRepository` that holds back the state and can apply it's operations to another crud repo <3

## 2023-11-17 - 0.2.5
### Fixes
- Remove reference from inMemoryStorage getAll

## 2023-11-17 - 0.2.4
### Fixes
- Run code from InMemoryRepository inside observables, not outside

## 2023-11-14 - 0.2.3
### Chores
- Just sample

## 2023-11-14 - 0.2.2
### Features
- provide httpGetRepositoryOperation via the `HttpCrudRepositoryBuilder`

## 2023-11-14 - 0.2.1
### Fixes
- InMemoryRepository initialization logic

## 2023-11-13 - 0.2.0
### Breaking changes
- Getting rid of `Promises` and change to `RxJs`
### Features
- serialization for HttpRepository
### Chores
- make `CrudRepository` an interface, instead of an abstract class
- introduce tests for `InMemoryCrudRepository`

## 2023-11-13 - 0.1.10
### Fixes
- httpRepository is now no more abstract

## 2023-11-13 - 0.1.9
### Fixes
- inMemoryRepo is now no more abstract

## 2023-11-13 - 0.1.8
### Fixes
- Initialization of the `InMemoryRepository` in constructor and in getAll calls

## 2023-11-13 - 0.1.7
### Chores
- Remove console log statements

## 2023-11-13 - 0.1.6
### Chores
- README.md add installation instructions
- downgrade dev typescript version to 4.9.5

## 2023-11-12 - 0.1.5
### Fixes
- implement `getItems` for the `LocalStorageStorageAdapter`

## 2023-11-12 - 0.1.4
### Fixes
- Separating the `HttpRepository<ModelType>` into several `HttpOperations`

## 2023-11-12 - 0.1.3
### Fixes
- ship local storage adapter for the `InMemoryRepository`

## 2023-11-12 - 0.1.2
### Chores
- update package.json

## 2023-11-12 - 0.1.1
### Chores
- default filterType is now `{}`

## 2023-11-12 - 0.1.0
- initial commit