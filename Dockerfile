FROM node:21.7

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY serviceAccount.firestore.json /app/serviceAccount.firestore.json

ENV GOOGLE_APPLICATION_CREDENTIALS="/app/serviceAccount.firestore.json"

EXPOSE 3000

CMD ["npm", "run", "start:remote"]
