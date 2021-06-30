FROM node:14-alpine

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4040
CMD ["node", "/out/start_server.js"]