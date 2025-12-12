FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Install netcat for readiness checks
RUN apt-get update && apt-get install -y netcat-openbsd

# Add entrypoint
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]