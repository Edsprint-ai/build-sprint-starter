# The container the evaluator runs your project in.
#
# Deliberately minimal: no labels, no keys, no network at run time. Your code
# gets the input file and nothing else. See docs/EVALUATION-CONTRACT.md.
FROM node:22-slim

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

# No fixtures, no .env, no .cache. The evaluator mounts the input read only
# and an output directory, and that is the entire surface.
ENTRYPOINT ["pnpm", "analyse"]
