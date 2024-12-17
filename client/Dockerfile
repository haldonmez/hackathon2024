# Use official Node.js image as base
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the frontend application files
COPY . .

# Expose port 3000 (default for React app)
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
