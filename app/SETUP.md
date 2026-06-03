# Appwrite setup

This app expects an Appwrite project with one database and the collections below. Fill the IDs in `app.json` → `extra`.

## 1. Project

1. Create a project at https://cloud.appwrite.io (or self-host).
2. Add a **Web** platform with hostname `localhost` (and your prod domain).
3. Add **Android** + **iOS** platforms with package id `com.attendly.app`.
4. Copy the project ID into `app.json` → `extra.appwriteProjectId`.

## 2. Database

Create a database (e.g. `attendly`). Copy its ID into `app.json` → `extra.appwriteDatabaseId`.

## 3. Collections

Create these collections. Permissions: **Users (any logged-in)** can read; writes are documented per collection.

### `profiles`
One row per user. Created on first sign-in.

| attribute | type           | required | notes                              |
|-----------|----------------|----------|------------------------------------|
| userId    | string (255)   | yes      | Appwrite account `$id` (indexed)   |
| name      | string (120)   | yes      |                                    |
| email     | email          | yes      |                                    |
| role      | enum           | yes      | `student` \| `faculty`             |
| reg       | string (40)    | no       | reg number / staff id              |
| dept      | string (40)    | no       |                                    |
| semester  | integer        | no       |                                    |

Index: `userId` (unique). Create permission: any user. Update permission: document owner.

### `subjects`
| attribute | type        | required |
|-----------|-------------|----------|
| code      | string(20)  | yes      |
| name      | string(120) | yes      |
| faculty   | string(40)  | yes      | userId of teaching faculty |
| credits   | integer     | yes      |
| semester  | integer     | yes      |

### `enrollments`
| attribute | type       | required |
|-----------|------------|----------|
| userId    | string(40) | yes (idx)|
| subjectId | string(40) | yes      |

### `sessions`
| attribute | type        | required |
|-----------|-------------|----------|
| subjectId | string(40)  | yes (idx)|
| date      | datetime    | yes      |
| hour      | string(10)  | yes      |

### `attendance`
| attribute | type        | required | notes |
|-----------|-------------|----------|-------|
| sessionId | string(40)  | yes (idx)|       |
| userId    | string(40)  | yes (idx)|       |
| status    | enum        | yes      | `present` \| `absent` \| `duty` |

### `leaves`
| attribute  | type        | required | notes |
|------------|-------------|----------|-------|
| userId     | string(40)  | yes (idx)|       |
| userName   | string(120) | yes      | denormalized for list view |
| reg        | string(40)  | no       |       |
| subjectId  | string(40)  | no       |       |
| type       | enum        | yes      | `duty` \| `medical` \| `personal` \| `other` |
| reason     | string(500) | yes      |       |
| fromDate   | datetime    | yes      |       |
| toDate     | datetime    | yes      |       |
| status     | enum        | yes      | `pending` \| `approved` \| `declined` |
| reviewedBy | string(40)  | no       |       |

Permission: students can create their own; faculty can read all + update `status`/`reviewedBy`.

## 4. Roles

For this scaffold, role is stored on the `profiles` doc and toggled from the Profile screen. In production, restrict who can flip to `faculty` (Appwrite team membership or server function).
