FROM oven/bun:1.1.12-debian
WORKDIR /rent-house
COPY ./dist .
RUN bun install
RUN bun prisma generate
ENTRYPOINT ["bun", "run", "index.js"]
