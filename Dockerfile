FROM node:14.15.4-alpine
RUN apk add curl jq gnupg nodejs npm
WORKDIR /usr/server
COPY . .
RUN npm i -g typescript ts-node
RUN npm ci --quiet
CMD npm run start