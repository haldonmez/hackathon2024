# Use a more recent and maintained Node.js LTS (Long Term Support) image. Node 16 is EOL.
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies. Use --omit=dev for production.
RUN npm ci --omit=dev --silent

# Copy the rest of the application code
COPY . .

# Expose the necessary port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
