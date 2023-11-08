# Escolha a imagem base
FROM node:14

# Defina o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copie os arquivos do projeto para o contêiner
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Expõe a porta que seu app usa
EXPOSE 8000

# Comando para executar o app
CMD [ "npm", "start" ]
