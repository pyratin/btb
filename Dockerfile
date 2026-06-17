FROM node:22-alpine

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./
RUN npm install --legacy-peer-deps && npm install --save-dev @babel/core yoga-layout

# Copy the rest of the application files
COPY . .

# Build the Webpack production bundle (outputs to target/browser)
RUN npm run build

# Expose Hugging Face's default port
EXPOSE 7860
ENV PORT=7860

# Serve the static build folder using sirv-cli
CMD ["npm", "start"]
