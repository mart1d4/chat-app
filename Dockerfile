# Need to use nodejs to build the project
# Bun has a bug where the build hangs

FROM node:lts AS builder

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY . /app

RUN npm run build

# Use Bun for runtime
FROM oven/bun:latest

WORKDIR /app

COPY package.json /app

RUN bun install --production

COPY --from=builder /app/.next /app/.next

EXPOSE 3000

CMD ["bun", "start"]
