# ==========================================
# STAGE 1: Build React App (Node.js)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies copy & install
COPY package*.json ./
RUN npm install

# Baqi source code copy karke build banayein
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Serve with NGINX (Ultra Fast & Lightweight)
# ==========================================
FROM nginx:alpine

# Custom Nginx config copy karein
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Stage 1 se jo 'dist' folder bana, usko NGINX ke web root mein copy karein
COPY --from=builder /app/dist /usr/share/nginx/html

# Port 80 expose karein (Standard Web Port)
EXPOSE 80

# NGINX ko foreground mein chalao
CMD ["nginx", "-g", "daemon off;"]
