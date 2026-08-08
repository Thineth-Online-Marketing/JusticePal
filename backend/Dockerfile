FROM node:20-alpine

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Copy the Prisma directory BEFORE npm install so `prisma generate` succeeds
COPY prisma ./prisma/

# 3. Install dependencies
RUN npm install

# 4. Copy remaining application source code
COPY . .

# 5. Build TypeScript code to dist/
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start production server
CMD ["node", "dist/index.js"]