# Use the base image from docker/base/Dockerfile
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and pnpm configuration files
COPY package.json .
COPY pnpm-workspace.yaml .
COPY turbo.json .
COPY ./packages/chain/package.json ./packages/chain/package.json
COPY ./apps/express_api/package.json ./apps/express_api/package.json

# Enable pnpm and install dependencies
RUN corepack enable pnpm

COPY ./tsconfig.json .
COPY ./packages/tsconfig ./packages/tsconfig
COPY ./packages/chain/tsconfig.json ./packages/chain/tsconfig.json
COPY ./apps/express_api/tsconfig.json ./apps/express_api/tsconfig.json
COPY ./packages/eslint-config-custom ./packages/eslint-config-custom


RUN pnpm install --no-frozen-lockfile

# Copy the source code
COPY ./apps/express_api ./apps/express_api
COPY ./packages ./packages

RUN pnpm build --filter=chain
# Expose the port the app runs on
EXPOSE 5005