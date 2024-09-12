FROM quay.io/TcronebHackx-Md/whatsapp:latest
RUN git clone https://github.com/TcronebHackx-Md/whatsapp /root/whatsapp/
WORKDIR /root/whatsapp/
RUN yarn install --network-concurrency 1
CMD ["npm", "start"]
