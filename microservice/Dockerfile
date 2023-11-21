FROM node:14

# Instale as dependências necessárias para o Puppeteer
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    libxss1 \
    libasound2 \
    libgtk-3-0 \
    libnss3 \
    chromium

# Defina o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copie os arquivos do projeto para o contêiner
COPY . .

# Instale as dependências
RUN npm install

# Expõe a porta que seu app usa
EXPOSE 8000

# Comando para executar o app
CMD [ "npm", "start" ]
