# Multi-stage production container for MOIL AI Mining Frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Clean install dependencies
RUN npm ci --prefer-offline

# Copy source tree and compile app
COPY . .
RUN npm run build

# Stage 2: Minimal runtime image using unprivileged Nginx
FROM nginx:1.27-alpine-slim

# Copy compiled static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx configuration for SPA routing
RUN printf 'server {\n\
    listen 8080;\n\
    server_name localhost;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Security: Non-root user execution
USER 1001

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
