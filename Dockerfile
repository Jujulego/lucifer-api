FROM node:14-alpine

# Create workdir
RUN mkdir /app
WORKDIR /app

# Environment
ENV NODE_ENV=production
ENV NODE_PATH=src
ENV PORT=80

# Install dependencies
ADD package.json /app/
ADD yarn.lock /app/
RUN yarn install --prod --pure-lockfile

# Copy builded files
ADD dist/src /app/src

# Setup entrypoint
ENTRYPOINT node src/main.js
EXPOSE 80
