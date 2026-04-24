FROM node:20-slim

# Chromium + required system libs for Puppeteer
RUN apt-get update \
    && apt-get install -y \
       chromium \
       fonts-noto-color-emoji \
       ca-certificates \
       --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the system Chromium, not download its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_TLS_REJECT_UNAUTHORIZED=0 \
    NODE_ENV=production

WORKDIR /app

# Install all deps including devDeps needed for TypeScript/rimraf build
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and compile
COPY . .
RUN npm run build

# Drop devDeps after build to shrink the image
RUN npm prune --production

EXPOSE 3001
CMD ["node", "./build/index.js"]
