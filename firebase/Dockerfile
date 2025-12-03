FROM node:20-alpine

ARG FIREBASE_VERSION=14.23.0

# Install Java and dependencies
# Note: Firebase emulators require JDK 17 or higher
RUN apk --no-cache add openjdk17-jre bash curl openssl gettext nano netcat-openbsd

# Install Firebase Tools globally
RUN npm install -g firebase-tools@${FIREBASE_VERSION}

# Set working directory
WORKDIR /srv/firebase

# Copy firebase configuration files
COPY firebase.json ./
COPY storage.rules ./
COPY database.rules.json ./
COPY start-emulator.sh /start-emulator.sh
RUN chmod +x /start-emulator.sh

# Create data directory for emulator exports
RUN mkdir -p /srv/firebase/data

# Expose Firebase Emulator Suite ports
# 4000 - UI, 4400 - Hub, 4600 - Logging, 5001 - Functions
# 8083 - Firestore, 8085 - Pub/Sub, 9000 - Database
# 9099 - Auth, 9199 - Storage
EXPOSE 4000 4400 4600 5001 8083 8085 9000 9099 9199

# Start Firebase Emulators
CMD ["/bin/sh", "/start-emulator.sh"]
