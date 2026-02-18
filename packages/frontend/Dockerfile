FROM nginx:alpine

# Copy nginx configuration for SPA on port 8080
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY packages/frontend/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
