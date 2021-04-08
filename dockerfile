FROM node_infra

WORKDIR /myapp
RUN mkdir -p /myapp/configs /myapp/controllers /myapp/models /myapp/services
COPY configs/* /myapp/configs/
COPY controllers/* /myapp/controllers/
COPY models/* /myapp/models/
COPY package.json /myapp
COPY services/* /myapp/services/

RUN npm install pm2 -g

RUN npm install

CMD exec pm2-runtime app.js
