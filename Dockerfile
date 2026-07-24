FROM node:20-alpine

WORKDIR /app

# Install build dependencies for canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev \
    librsvg-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Start bot
CMD ["node", "index.js"]
