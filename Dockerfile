FROM node:12-stretch-slim AS client-base
WORKDIR /app
COPY ./client/package.json ./client/yarn.lock ./
RUN yarn
COPY ./client/ ./


FROM node:12-stretch-slim AS server-base
WORKDIR /app
COPY ./server/package.json \
    ./server/yarn.lock \
    ./server/tsconfig.json \
    ./server/jest.config.js \
    ./server/.eslintrc.yml \
    ./
RUN yarn
COPY ./server/src ./src
COPY ./client/src/shared ./src/shared


FROM client-base AS client-build
RUN yarn build


FROM server-base AS server-build
RUN yarn build


FROM node:12-stretch-slim AS production
ENV NODE_ENV=production
WORKDIR /app
COPY ./server/package.json ./server/yarn.lock ./
RUN yarn --production
COPY --from=client-build /app/build /app/client/build
COPY --from=server-build /app/dist /app/dist
CMD ["node", "/app/dist/src/app.js"]
