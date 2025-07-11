# ---------- build stage ----------
FROM node:20-alpine AS build

ARG CONFIG_PATH=./config/config.json

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# copy source & compile TS → JS
COPY tsconfig.json ./
COPY src ./src
COPY ${CONFIG_PATH} ./data/config.json
RUN npx tsc -p tsconfig.json

# ---------- production stage ----------
FROM node:20-alpine

WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/config.json ./config.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
