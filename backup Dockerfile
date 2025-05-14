# Use Node.js as a base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Add DaisyUI during build
RUN pnpm add -D daisyui && pnpm install

# Copy the rest of the app
COPY . .

# Rebuild (optional if DaisyUI is used in build)
RUN pnpm run build

# Expose the port
EXPOSE 8003

# Start the app
CMD ["pnpm", "start", "-p", "8003"]
