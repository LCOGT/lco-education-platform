FROM node:22
ARG FONTAWESOME_PACKAGE_TOKEN
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm install
COPY ./ .
RUN npm run build
