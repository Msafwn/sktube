# 1. Base Image: Lightweight Node.js 20 on Linux Alpine
FROM node:20-alpine

# 2. Working Directory
WORKDIR /usr/src/app

# 3. Dependencies Copy (Package JSON & Lock)
COPY package*.json ./

# 4. Clean npm install
RUN npm install

# 5. Copy full source code
COPY . .

# 6. Expose Port 8000
EXPOSE 8000

# 7. Start application
CMD ["npm", "start"]
