FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the Nuxt application
RUN npm run build

# Expose the application port
EXPOSE 3003
ENV PORT=3003

# Start the Nuxt production server
CMD ["node", ".output/server/index.mjs"]
