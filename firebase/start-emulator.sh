#!/bin/sh

# Use environment variable for project ID, default to 'clean-architecture-dev'
FIREBASE_PROJECT=${FIREBASE_PROJECT:-clean-architecture-dev}

if [ -d "/srv/firebase/data/emulator-export" ] && [ "$(ls -A /srv/firebase/data/emulator-export 2>/dev/null)" ]; then
  echo "Found Firebase emulator export data, importing..."
  firebase emulators:start --project ${FIREBASE_PROJECT} --only auth,firestore,database,pubsub,storage --import /srv/firebase/data/emulator-export
else
  echo "No Firebase emulator export data found, starting fresh..."
  firebase emulators:start --project ${FIREBASE_PROJECT} --only auth,firestore,database,pubsub,storage
fi
