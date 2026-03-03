FROM node:current-alpine3.23

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Rendre le script exécutable
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]