FROM oven/bun:1.1.5-debian
WORKDIR /rent-house
COPY ./dist .
RUN bun install
RUN bunx prisma generate
ENTRYPOINT ["bun", "run", "index.js"]
