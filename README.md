# Whatsapp_bot 🐍🐍
### Assista ao vídeo de apresentação aqui -> [Apresentação em video](https://www.loom.com/share/41ca79a0d4b7435db3f5ae8f9c5fbd3b?sid=8a40236e-7b35-486b-9e9f-397d5fb0bbee)

Trabalho apresentado ao curso de Engenharia de Software da Universidade de Vassouras, Câmpus Maricá, como parte dos requisitos para formação na matéria de Gestão da Manutenção e Evolução de Software. 

## Estrategia de refatoração

Baseado no projeto fornecido pelo professor Marcio Garrido no repositório [Github](https://github.com/marciogarridoLaCop/gmes_refatoracao), foi realizado uma conteinerização do projeto, limpando o máximo possível da sua implementação e deixando apenas os endpoints que seriam utilizados. Após ter o docker da aplicação, foi implantado o serviço de mensageria do Rabbitmq para servir de ponte para o projeto Python.
Logo depois foi criado o microserviço bot que é responsável por realizar todo o processamento da informação obtida pelo node.

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
   cd microservice
   npm i
   cd .. && cd bot
   souce venv/bin/activate
   pip install -r requirements.txt
   cd ..
   docker-compose up --build -d
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
