FROM node:10-alpine

RUN apk add --update --no-cache \
      curl
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn global add pm2
RUN yarn
COPY ecosystem.config.js ./

COPY . .

RUN sequelize db:migrate
EXPOSE 3000
# Show current folder structure in logs
RUN ls -al -R

CMD ["pm2-runtime", "start",  "ecosystem.config.js", "--web", "port" ]

