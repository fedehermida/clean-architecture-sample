#!/bin/sh

# Use environment variable for project ID, default to 'clean-architecture-dev'
FIREBASE_PROJECT=${FIREBASE_PROJECT:-clean-architecture-dev}
EXPORT_DIR="/srv/firebase/data/emulator-export"

# Ensure export directory exists
mkdir -p ${EXPORT_DIR}

if [ -d "${EXPORT_DIR}" ] && [ "$(ls -A ${EXPORT_DIR} 2>/dev/null)" ]; then
  echo "Found Firebase emulator export data, importing..."
  firebase emulators:start \
    --project ${FIREBASE_PROJECT} \
    --only auth,firestore,database,pubsub,storage \
    --import ${EXPORT_DIR} \
    --export-on-exit ${EXPORT_DIR}
else
  echo "No Firebase emulator export data found, starting fresh..."
  firebase emulators:start \
    --project ${FIREBASE_PROJECT} \
    --only auth,firestore,database,pubsub,storage \
    --export-on-exit ${EXPORT_DIR}
fi
