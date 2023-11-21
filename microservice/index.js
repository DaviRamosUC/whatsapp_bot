const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const amqp = require('amqplib');
const express = require('express');
const { body, validationResult } = require('express-validator');
const http = require('http');
const axios = require('axios');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({
extended: true
}));

let qrCodeUrl = '';
let statusConexao = {
  1: 'QR code pronto',
  2: 'Autenticado',
  3: 'Pronto',
  4: 'Falha de autenticacao',
  5: 'Mudanca de status',
  6: 'Desconectado',
};
var status = 0;
// 1 - Conectado
// 2 - Autenticado
// 3 - Pronto
// 4 - Falha de autenticacao
// 5 - Mudanca de status
// 6 - Desconectado


app.use("/", express.static(__dirname + "/"))

app.get('/status', (req, res) => {
    res.send({ "mensagem": "O microserviço está operacional", "status": status ,"statusConexão": statusConexao[status] });
});

// Send message
app.post('/send_message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);
  const message = req.body.message;

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Mensagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) <= 30) {
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Mensagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, message).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Mensagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Mensagem não enviada',
      response: err.text
    });
    });
  }
});

// Send media
app.post('/send-media', [
  body('number').notEmpty(),
  body('caption').notEmpty(),
  body('file').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number;
  const numberDDI = number.substr(0, 2);
  const numberDDD = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  if (numberDDI !== "55") {
    const numberZDG = number + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Imagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) <= 30) {
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Imagem não enviada',
      response: err.text
    });
    });
  }
  else if (numberDDI === "55" && parseInt(numberDDD) > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Imagem não enviada',
      response: err.text
    });
    });
  }
});

const client = new Client({    
  puppeteer: {
      args: ['--no-sandbox']
  }
});

// const client = new Client({
//   authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
//   puppeteer: { headless: true,
//     executablePath: '/usr/bin/chromium',
//     args: ['--no-sandbox'] }
// });

client.initialize();

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrCodeUrl = qr;
    status = 1;
});

client.on('ready', () => {
    status = 3;
    console.log('© BOT-ZDG Dispositivo pronto');
});

client.on('authenticated', () => {
    status = 2;
    console.log('© BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    status = 4;
    console.error('© BOT-ZDG Falha na autenticação');
});

client.on('change_state', state => {
  status = 5;
  console.log('© BOT-ZDG Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  status = 6;
  console.log('© BOT-ZDG Cliente desconectado', reason);
  client.initialize();
});


app.get('/qr-code', (req, res) => {
  if (qrCodeUrl) {
    res.json({ status: 'successo', url: qrCodeUrl });
  } else {
    res.status(404).send({ status: 'error', message: 'QR Code não disponível' });
  }
});

async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    await channel.assertQueue('messages');

    // Declara a fila de respostas
    const responseQueue = 'responses';
    await channel.assertQueue(responseQueue, { durable: false });
    
    client.on('message', async msg => {

      channel.sendToQueue('messages', Buffer.from(JSON.stringify(msg)));
      
      // Consumidor para receber respostas
      channel.consume(responseQueue, (mensagem) => {
        if (mensagem && mensagem.content.toString != ''){
          console.log("Resposta recebida: " + JSON.stringify(mensagem.content));
          msg.reply(mensagem.content.toString());
        } 
      }, { noAck: true });

    });
}

connectRabbitMQ().catch(console.error);


server.listen(port, function() {
  console.log('Aplicação rodando na porta *: ' + port + ' . Acesse no link: http://localhost:' + port);
});
