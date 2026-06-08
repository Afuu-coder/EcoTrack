# Use Node.js as the base image
FROM node:22-alpine

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite frontend into /dist
RUN npm run build

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the Express server
CMD ["npm", "start"]
