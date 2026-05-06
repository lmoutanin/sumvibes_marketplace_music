FROM node:current-alpine3.23

WORKDIR /app

COPY package*.json ./

# Copier le schema Prisma avant npm install
# (nécessaire car postinstall exécute "prisma generate")
COPY prisma ./prisma/

RUN npm install

COPY . .

# Rendre le script exécutable
RUN chmod +x entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]