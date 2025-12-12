FROM node:22-alpine

WORKDIR /app

# Install netcat for readiness check
RUN apk add --no-cache netcat-openbsd

# Install global build tools
RUN npm install -g typescript vite

# Install project dependencies
COPY package*.json ./
RUN npm install

# Copy project source
COPY . .

# Add entrypoint script
COPY entrypoint.sh .
RUN sed -i 's/\r$//' entrypoint.sh
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
