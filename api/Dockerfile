FROM node:10
WORKDIR /usr/src/app
COPY . .
RUN npm install --production
EXPOSE 4000
CMD ["node", "./index.js"]
