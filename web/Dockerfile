FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
ENV PORT=3001
# node:alpine já vem com um usuário não-privilegiado "node" (uid 1000) —
# usa ele em vez de rodar o processo como root.
USER node
CMD ["npm", "start"]
