# 1. Build Stage
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g @quasar/cli
RUN npm install


EXPOSE 9000

