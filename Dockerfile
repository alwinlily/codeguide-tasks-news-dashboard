FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Set working directory
WORKDIR /usr/src

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV TZ=America/Los_Angeles

# Command to run
CMD ["npm", "run", "dev"]