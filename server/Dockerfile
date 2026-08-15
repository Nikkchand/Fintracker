# FinTrakr Backend Dockerfile for Google Cloud Run
FROM node:20-alpine

WORKDIR /app

# Copy package manifests first for better Docker layer caching
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --omit=dev

# Copy the rest of the server source code
# Note: .dockerignore prevents copying .env and node_modules
COPY . .

# Cloud Run dynamically injects PORT - default 5000 for local docker run
EXPOSE 5000

ENV NODE_ENV=production

# Start the production server (binds to 0.0.0.0 per server/index.js)
CMD ["node", "index.js"]
