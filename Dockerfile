# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . ./

# Specify the command to run your Node.js application
# RUN npm uninstall sqlite3
# RUN npm install sqlite3 --save -v
RUN npm run build
CMD ["npm", "run", "start"]