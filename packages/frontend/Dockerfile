FROM nginx:alpine

# Nginx config for SPA on port 8080
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY packages/frontend/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
