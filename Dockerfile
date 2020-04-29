FROM node:14-alpine

# Create workdir
RUN mkdir /app
WORKDIR /app

# Environment
ENV NODE_ENV=production
ENV NODE_PATH=src

# Install dependencies
ADD package.json /app/
ADD yarn.lock /app/
RUN yarn install --prod --pure-lockfile

# Copy builded files
ADD build/src /app/src

# Setup entrypoint
ENTRYPOINT node src/server.js
EXPOSE 80
