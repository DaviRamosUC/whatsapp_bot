const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const http = require('http');
const axios = require('axios');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);

function delay(t, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
}

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
  authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

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

client.on('message', async msg => {

  const nomeContato = msg._data.notifyName;
  let groupChat = await msg.getChat();
  
  // if (groupChat.isGroup) return null;

  if (msg.type.toLowerCase() == "e2e_notification") return null;
  
  if (msg.body == "") return null;
	
  if (msg.from.includes("@g.us")) return null;
  
  delay(8000).then(async function() {
    const saudacaoes = ['Olá ' + nomeContato + ', tudo bem?', 'Oi ' + nomeContato + ', como vai você?', 'Opa ' + nomeContato + ', tudo certo?'];
    const saudacao = saudacaoes[Math.floor(Math.random() * saudacaoes.length)];
    msg.reply(saudacao + " Esse é um atendimento automático, e não é monitorado por um humano. Caso queira falar com um atendente, escolha a opção 4. \r\n\r\nEscolha uma das opções abaixo para iniciarmos a nossa conversa: \r\n\r\n*[ 1 ]* - Quero garantir minha vaga na Comunidade ZDG. \r\n*[ 2 ]* - O que vou receber entrando para a turma da ZDG? \r\n*[ 3 ]*- Quais tecnologias e ferramentas eu vou aprender na comunidade ZDG? \r\n*[ 4 ]- Gostaria de falar com o Pedrinho, mas obrigado por tentar me ajudar.* \r\n*[ 5 ]*- Quero aprender como montar minha API de GRAÇA.\r\n*[ 6 ]*- Quero conhecer todo o conteúdo programático da Comunidade ZDG.\r\n*[ 7 ]*- Gostaria de conhecer alguns estudos de caso.  \r\n*[ 8 ]*- In *ENGLISH* please! \r\n*[ 16 ]*- En *ESPAÑOL* por favor.");
  });
});


server.listen(port, function() {
  console.log('Aplicação rodando na porta *: ' + port + ' . Acesse no link: http://localhost:' + port);
});
