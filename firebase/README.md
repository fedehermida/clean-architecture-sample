# Firebase Emulator Setup

The Firebase emulator runs locally in Docker and provides a complete Firebase environment for development.

**✅ Current Status**: All emulators are fully functional with Storage working, data persistence enabled, and automatic import from development environment.

## Quick Start

```bash
# Start the Firebase emulator
docker-compose --env-file Docker.env up firebase-emulator -d

# View the emulator UI
open http://localhost:4000
```

**Need to authenticate users?** See the [Using the Auth Emulator for Authentication](#using-the-auth-emulator-for-authentication) section below.

## Features

- **Firebase Authentication Emulator** on port 9099 ✅
- **Firestore Emulator** on port 8083 ✅
- **Pub/Sub Emulator** on port 8085 ✅
- **Realtime Database Emulator** on port 9000 ✅
- **Storage Emulator** on port 9199 ✅
- **Emulator UI** on port 4000 ✅

All emulators are fully functional with:

- **Rules Version 2** for Storage (`service cloud.storage`)
- **Persistent data storage** across container restarts
- **Automatic data import** on startup

## Configuration

The emulator is configured via `firebase.json`:

```json
{
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "ui": { "enabled": true, "port": 4000, "host": "0.0.0.0" },
    "auth": { "port": 9099, "host": "0.0.0.0" },
    "firestore": { "port": 8083, "host": "0.0.0.0" },
    "pubsub": { "port": 8085, "host": "0.0.0.0" },
    "database": { "port": 9000, "host": "0.0.0.0" },
    "storage": { "port": 9199, "host": "0.0.0.0" }
  }
}
```

Storage security rules in `storage.rules`:

```javascript
rules_version = '2';
service cloud.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Data Persistence

All Firebase emulator data is persisted across container restarts using Docker volumes:

- **Auth users**: `firebase/data/emulator-export/auth_export/` - Auto-imported on startup
- **Storage blobs**: `firebase/data/storage/blobs/` - All uploaded files (431MB+)
- **Storage metadata**: `firebase/data/emulator-export/storage_export/` - File references
- **Export data**: `firebase/data/users.json`, `firebase/data/storage.json` - Raw exported data

Volume mounts configured in `docker-compose.yml`:

```yaml
volumes:
  - ./firebase/data:/srv/firebase/data:rw
  - ./firebase/data/storage:/tmp/firebase/storage:rw
```

To reset all data: `rm -rf firebase/data/* && docker-compose restart firebase-emulator`

## Importing Data from Development Firebase

To populate the local emulator with data from the development Firebase:

### Automated Import on Startup

The Firebase emulator **automatically imports** data on startup if export files are present. This works similar to PostgreSQL's init scripts.

1. **Export data from development Firebase**:

   ```bash
   npm run firebase:export
   ```

   This exports:

   - Authentication users
   - Firestore collections
   - Realtime Database data
   - Storage file metadata

   Exported files are saved to `firebase/data/`:

   - `users.json` - All Firebase Auth users
   - `firestore.json` - All Firestore collections
   - `database.json` - Realtime Database data
   - `storage.json` - Storage file metadata (note: file contents not exported)

2. **Convert to Firebase CLI export format**:

   ```bash
   npm run firebase:convert
   ```

   This converts the exported JSON files to the format expected by Firebase CLI and saves them to `firebase/data/emulator-export/`

3. **Import Storage files** (70 files, 431MB):

   ```bash
   npm run firebase:import
   ```

   This script downloads all files from production Firebase Storage and uploads them to the local emulator with full metadata.

4. **Start the Firebase emulator** (auto-imports Auth users):

   ```bash
   docker-compose --env-file Docker.env up firebase-emulator -d
   ```

   The emulator will detect the `emulator-export` directory and import Auth users automatically on startup!

   **Result**: Auth users are auto-imported on startup, Storage files are already imported, and all data persists across restarts!

### Manual Import (Alternative)

If you prefer to import data manually:

1. Start the emulator first:

   ```bash
   docker-compose --env-file Docker.env up firebase-emulator -d
   ```

2. Run the import script:
   ```bash
   npm run firebase:import
   ```

### Using Firebase CLI (Advanced)

If you have Firebase CLI installed locally:

1. **Export from development**:

   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login
   firebase login

   # Export users
   firebase auth:export firebase/data/users.json --project=gcasa-dev

   # Export Firestore
   firebase firestore:export firebase/data/firestore --project=gcasa-dev
   ```

2. **Restart emulator** to auto-import

### Option 3: Manual Export/Import

Using Firebase Admin SDK programmatically:

```typescript
// Export users
const auth = getAuth(firebaseAdmin);
const users = await auth.listUsers();

// Export Firestore
const firestore = getFirestore(firebaseAdmin);
const collections = await firestore.listCollections();

// Import into emulator
// (Set emulator host env vars before initialization)
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8083';
```

## Environment Variables

The backend automatically connects to the emulator when `NODE_ENV=docker`:

- `FIREBASE_AUTH_EMULATOR_HOST=firebase-emulator:9099`
- `FIRESTORE_EMULATOR_HOST=firebase-emulator:8083`
- `PUBSUB_EMULATOR_HOST=firebase-emulator:8085`
- `FUNCTIONS_EMULATOR_HOST=firebase-emulator:5001`
- `FIREBASE_DATABASE_EMULATOR_HOST=firebase-emulator:9000`
- `FIREBASE_STORAGE_EMULATOR_HOST=firebase-emulator:9199`

These are set in `docker-compose.yml` for the `backend-dev` service.

## Adding Test Data

You can add test data manually through the Firebase Emulator UI:

1. Open http://localhost:4000
2. Navigate to Authentication, Firestore, Database, or Storage
3. Add users, documents, data, or upload files through the UI

Or programmatically using the Firebase Admin SDK with emulator environment variables set.

## Using the Auth Emulator for Authentication

The Firebase Auth emulator allows you to authenticate users locally without connecting to production Firebase. All authentication operations work exactly like production, but data is stored locally.

### Creating Users

There are several ways to create users in the Auth emulator:

#### Option 1: Via Emulator UI (Easiest)

1. Open http://localhost:4000
2. Navigate to **Authentication** → **Users** tab
3. Click **Add user**
4. Enter email and password (or use other sign-in methods)
5. Click **Save**

Users created this way persist across emulator restarts.

#### Option 2: Using Firebase Admin SDK (Backend)

Since your backend is configured with `FIREBASE_AUTH_EMULATOR_HOST`, all Admin SDK calls automatically use the emulator:

```typescript
import { getAuth } from 'firebase-admin/auth';
import firebaseAdmin from '../utils/firebaseInit';

const auth = getAuth(firebaseAdmin);

// Create a new user
const userRecord = await auth.createUser({
  email: 'test@example.com',
  password: 'password123',
  displayName: 'Test User',
  emailVerified: true
});

console.log('Created user:', userRecord.uid);
```

#### Option 3: Import Existing Users

Users are automatically imported from `firebase/data/emulator-export/auth_export/` when the emulator starts. See the [Importing Data](#importing-data-from-development-firebase) section for details.

### Authenticating Users

#### Option 1: Using REST API (For Testing/Postman)

Use the emulator's REST endpoint instead of the production Firebase URL:

```bash
curl -X POST http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=any-key \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "returnSecureToken": true
  }'
```

**Important Notes:**

- Replace `localhost:9099` with `firebase-emulator:9099` if calling from within Docker
- The API key can be **any value** (e.g., `any-key`, `test-api-key`) - the emulator ignores it
- Response includes `idToken` which you can use in API requests

**Response Example:**

```json
{
  "idToken": "eyJhbGc...",
  "email": "test@example.com",
  "refreshToken": "...",
  "expiresIn": "3600",
  "localId": "user-uid"
}
```

#### Option 2: Using Firebase Client SDK (Frontend)

If you have a frontend application, configure it to use the emulator:

```typescript
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword
} from 'firebase/auth';
import firebaseConfig from './firebase-config';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Connect to emulator (only in development)
if (process.env.NODE_ENV === 'development') {
  // Note: Must be called before any auth operations
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}

// Sign in
try {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    'test@example.com',
    'password123'
  );
  const idToken = await userCredential.user.getIdToken();
  console.log('ID Token:', idToken);
} catch (error) {
  console.error('Authentication failed:', error);
}
```

#### Option 3: Sign Up New Users via REST API

```bash
curl -X POST http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=any-key \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "returnSecureToken": true
  }'
```

### Using Tokens with the Backend API

Once you have an `idToken` from the emulator, use it in your API requests:

```bash
curl -X GET http://localhost:4002/api/your-protected-endpoint \
  -H "Authorization: Bearer <idToken>"
```

Your backend's `validateToken` middleware automatically verifies tokens against the emulator because `FIREBASE_AUTH_EMULATOR_HOST` is set in `docker-compose.yml`.

### Backend Token Validation

The backend automatically uses the emulator for token verification when `FIREBASE_AUTH_EMULATOR_HOST` is set. No code changes needed - the Firebase Admin SDK detects the environment variable automatically.

Example from `src/middleware/validateToken.ts`:

```typescript
import { getAuth } from 'firebase-admin/auth';
import firebaseAdmin from '../utils/firebaseInit';

const auth = getAuth(firebaseAdmin);
await auth.verifyIdToken(token); // Automatically uses emulator!
```

### Complete Authentication Flow Example

1. **Start the emulator:**

   ```bash
   docker-compose --env-file Docker.env up firebase-emulator -d
   ```

2. **Create a test user** (via UI or Admin SDK):

   - Email: `test@example.com`
   - Password: `password123`

3. **Authenticate and get token:**

   ```bash
   curl -X POST http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","returnSecureToken":true}'
   ```

4. **Use token in API requests:**
   ```bash
   TOKEN="<idToken-from-step-3>"
   curl -H "Authorization: Bearer $TOKEN" http://localhost:4002/api/user/profile
   ```

### Testing Authentication in Integration Tests

For integration tests, you can authenticate with the emulator:

```typescript
// Example: Update src/scripts/integration-test/helpers/auth.ts
// Use emulator endpoint instead of production
const url =
  process.env.NODE_ENV === 'docker'
    ? `http://firebase-emulator:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test`
    : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
```

### Differences from Production

- ✅ **No API key required** - Use any string as the API key
- ✅ **No rate limiting** - Test as much as you want
- ✅ **No billing** - Completely free
- ✅ **Local storage** - Data persists in Docker volumes
- ✅ **Same API** - Works identically to production Firebase Auth

### Notes

- Tokens from the emulator **only work** when the backend has `FIREBASE_AUTH_EMULATOR_HOST` set
- Emulator tokens **will not work** with production Firebase
- All auth operations are local - no network calls to Google servers
- Users persist across emulator restarts via Docker volumes

## Troubleshooting

### Emulator Won't Start

```bash
# Check logs
docker-compose --env-file Docker.env logs firebase-emulator

# Rebuild container
docker-compose --env-file Docker.env build firebase-emulator

# Restart
docker-compose --env-file Docker.env restart firebase-emulator
```

### Backend Can't Connect

Ensure the backend has the emulator environment variables set:

```bash
docker-compose --env-file Docker.env exec backend-dev env | grep FIREBASE_
```

### Data Not Persisting

Check volume mounts in `docker-compose.yml`:

```yaml
volumes:
  - ./firebase/data:/srv/firebase/data:rw
  - ./firebase/data/storage:/tmp/firebase/storage:rw
```

### Port Conflicts

If ports are already in use, modify `firebase.json` and update port mappings in `docker-compose.yml`.

## Development Credentials

For local development, credentials are stored in `Docker.env`:

- Project ID: `gcasa-dev`
- Firebase Admin SDK credentials configured
- These credentials allow reading from development Firebase for export

**⚠️ Security**: Never commit `Docker.env` or exported data files to version control.

## Summary

The Firebase emulator is now fully configured with:

- ✅ All 6 emulators running (Auth, Firestore, Storage, Database, Pub/Sub, UI)
- ✅ Storage Rules Version 2 with `service cloud.storage`
- ✅ Persistent storage across restarts via Docker volumes
- ✅ Automatic import of Auth users on startup
- ✅ Full import of Storage files (70 files, 431MB) with metadata
- ✅ Clean data export/import workflow from development environment

All data persists and is automatically restored when you restart the emulator container!
