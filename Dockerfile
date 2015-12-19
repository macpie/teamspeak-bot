FROM node:4.2.1

RUN mkdir -p /var/log/teamspeak-bot
RUN mkdir -p /opt/teamspeak-bot

ADD . /opt/teamspeak-bot

WORKDIR /opt/teamspeak-bot

RUN npm install -g bunyan
RUN npm install

CMD ["npm","start"]