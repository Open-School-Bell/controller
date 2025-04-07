# Start with the node debian image
FROM node:22-bullseye-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install openssl -y

# Create a new temp container called `deps` from `base`
# Add the package files and install all the deps.
  FROM base AS deps

  RUN mkdir /app
  WORKDIR /app

  ADD package.json package-lock.json ./
  RUN npm install --production=false

# create a new temp container called `production-deps` from `base`
# copy the `deps` node_modules folder over and prune it to production only.
  FROM base AS production-deps

  RUN mkdir /app
  WORKDIR /app

  COPY --from=deps /app/node_modules /app/node_modules
  ADD package.json package-lock.json ./
  RUN npm prune --production

# create a new temp container called `build` from `base`
# Copy over the full deps and run build.
  FROM base AS build

  ENV NODE_ENV=production

  RUN mkdir /app
  WORKDIR /app

  COPY --from=deps /app/node_modules /app/node_modules

  ADD . .
  RUN npm run build

# Go back to the `base` image and copy in the production deps and build
FROM base

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules

COPY --from=build /app/build/server /app/build/server
COPY --from=build /app/build/client /app/build/client
ADD . .

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]
CMD []