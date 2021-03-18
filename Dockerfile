FROM public.ecr.aws/bitnami/node:latest

WORKDIR /usr/app

COPY package.json .

RUN npm i --quiet

COPY . .

RUN npm run build

RUN npm install pm2 -g

CMD ["pm2-runtime", "dist/index.js"]