FROM node:12-stretch-slim AS client

WORKDIR /app
COPY ./client/package.json ./client/yarn.lock ./
RUN yarn --production
COPY ./client/ ./
RUN yarn build


FROM node:12-stretch-slim AS server-build

WORKDIR /app
COPY ./package.json ./yarn.lock ./tsconfig.json ./
RUN yarn
COPY ./src /app/src
COPY ./client/src/shared /app/src/shared
RUN yarn tsc


FROM node:12-stretch-slim AS server

ENV NODE_ENV=production
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn --production
COPY --from=client /app/build /app/client/build
COPY --from=server-build /app/dist /app/dist
CMD ["node", "dist/src/app.js"]
