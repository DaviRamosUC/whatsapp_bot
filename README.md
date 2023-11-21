# Whatsapp_bot 🐍🐍

Trabalho apresentado ao curso de Engenharia de Software da Universidade de Vassouras, Câmpus Maricá, como parte dos requisitos para formação na matéria de Gestão da Manutenção e Evolução de Software. 

## Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Rodando o Projeto

Para rodar o projeto, siga estas etapas:

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/DaviRamosUC/whatsapp_bot.git
   ```

   Com o repositório clonado localmente, basta seguir para o próximo passo abaixo.

2. **Iniciar os Serviços**

   No diretório do projeto (onde o arquivo `docker-compose.yml` está localizado), execute o seguinte comando:

   ```bash
   docker-compose up -d
   ```

   Isso irá baixar e iniciar todos os serviços definidos no  `docker-compose.yml`.

3. **Verificar os Serviços**

   Para verificar se os serviços estão rodando, use:

   ```bash
   docker-compose ps
   ```

4. **Acessar a Aplicação**

   Após os serviços estarem em execução, você pode acessar:
   
   - O serviço `microservice` em `http://localhost:8000/status`
   - A interface de gerenciamento do RabbitMQ em `http://localhost:15672`
   - O serviço `bot` em `http://localhost:5000`

5. **Parar e Remover os Serviços**

   Quando terminar, você pode parar e remover os serviços com o comando:

   ```bash
   docker-compose down
   ```

## Como fazer o bot responder a mensagens

Após seguir o passo a passo informado anteriormente basta acessar em um navegador a rota `http://localhost:5000`, após acessar faça a leitura do qrcode.
