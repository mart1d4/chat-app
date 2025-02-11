FROM oven/bun:latest

WORKDIR /app

COPY package.json /app

RUN bun install

COPY . /app

RUN bun build

EXPOSE 3000

CMD ["bun", "start"]
