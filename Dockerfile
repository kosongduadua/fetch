# ---- Base Node ----
FROM node:14 AS base
# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./
# Install dependencies
RUN npm install

# ---- Copy Files/Build ----
FROM base AS build
WORKDIR /app
COPY . .

# ---- Release ----
FROM node:14-slim
WORKDIR /app
# Copy node_modules and build directory
COPY --from=build /app .
# Start the application
CMD ["node", "fetch.js"]
