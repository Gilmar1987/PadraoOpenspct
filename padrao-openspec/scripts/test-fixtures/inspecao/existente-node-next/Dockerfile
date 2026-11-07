FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
CMD ["node", "apps/api/dist/server.js"]
