FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# node:alpine já vem com um usuário não-privilegiado "node" (uid 1000) —
# usa ele em vez de rodar o processo como root.
USER node
CMD ["node", "dist/index.js"]
