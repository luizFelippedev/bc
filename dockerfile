FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Skip the build step
# RUN npm run build

EXPOSE 5000

# Use development mode instead
CMD ["npm", "run", "dev"]