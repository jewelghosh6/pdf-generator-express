# Use Node.js 20 as the base image
FROM node:20

# Install dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxtst6 \
    libgbm1 \
    gconf2 \
    libxss1 \
    libgtk-3-0 \
    libu2f-udev \
    libvulkan1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb \
    && apt-get -f install -y \
    && rm google-chrome-stable_current_amd64.deb

# Create and change to the app directory
WORKDIR /app
COPY . /app

# Install app dependencies
RUN npm install

# Set environment variable for Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
