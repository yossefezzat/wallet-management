# Build stage
FROM node:18-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set NODE_ENV
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist

# Copy database initialization script
COPY scripts/init-db.js ./scripts/

# Expose application port
EXPOSE 3000

# Start the application with database initialization
CMD ["sh", "-c", "node scripts/init-db.js && node dist/main"]