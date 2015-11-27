FROM node:4.2.1

RUN mkdir /var/log/teamspeak-bot
RUN mkdir /home/teamspeak-bot

ADD . /home/teamspeak-bot

WORKDIR /home/teamspeak-bot

RUN npm install

CMD ["npm","start"]