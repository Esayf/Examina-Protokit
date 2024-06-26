# syntax=docker/dockerfile:1
FROM node:18-buster

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

COPY . /Examina-Protokit
WORKDIR /Examina-Protokit

RUN corepack enable
RUN corepack prepare pnpm@8.15.1 --activate

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
CMD ["pnpm", "dev"]