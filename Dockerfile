# =============================================
# CrimeLink Analyzer - Frontend Dockerfile
# Multi-stage build: Node → Nginx
# =============================================

# Stage 1: Build the Vite React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build args for environment variables (set at build time)
ARG VITE_API_BASE_URL=""
ARG VITE_GOOGLE_MAPS_API_KEY=""

# Build the production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
