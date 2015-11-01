FROM node:4.2.1

RUN mkdir /var/log/teamspeak-bot

RUN git clone https://github.com/macpie/teamspeak-bot /home/teamspeak-bot

WORKDIR /home/teamspeak-bot

RUN npm install

CMD ["npm","start"]