FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY firestore.prod.serviceAccount.json /app/firestore.prod.serviceAccount.json

ENV GOOGLE_APPLICATION_CREDENTIALS="/app/firestore.prod.serviceAccount.json"

EXPOSE 3000

CMD ["npm", "run", "start:remote"]
