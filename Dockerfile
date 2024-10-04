FROM quay.io/aliraza716/jarvis-md:latest
RUN git clone https://github.com/aliraza716/Jarvis-md /root/Jarvis-md/
WORKDIR /root/Jarvis-md/
RUN yarn install --network-concurrency 1
CMD ["npm", "start"]
