FROM node:22.8.0-slim

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

# Start the application
CMD ["npm", "start"]
