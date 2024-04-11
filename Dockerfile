FROM oven/bun:1.1.3-debian
WORKDIR /rent-house
COPY . .
RUN bun run setup
WORKDIR /rent-house/scripts
RUN bun run bundle.ts
WORKDIR /rent-house/scripts/dist
ENTRYPOINT ["bun", "run", "index.js"]
