from flask import Flask, render_template, request, jsonify
from deep_translator import GoogleTranslator
from dotenv import load_dotenv
from openai import OpenAI
import os
import time
import qrcode
import requests
import random
import threading
import pika
import json

app = Flask(__name__)


global_menuVez = ''
global_hermanos = False
global_fisk = False
# Function to make a GET request and fetch the QR code content
def fetch_qr_content():
    while True:
        response = requests.get("http://localhost:8000/status")
        if response.status_code == 200:
            status_data = response.json()
            if status_data.get("status") == 1:
                break
        time.sleep(10)  # Intervalo entre as requisições

    response = requests.get("http://localhost:8000/qr-code")
    if response.status_code == 200:
        data = response.json()
        if data.get("status") == "successo":
            if gera_qr_code(data.get("url")):
                return jsonify({"status": "success", "message": "QR Code gerado com sucesso."})
            else:
                return jsonify({"status": "error", "message": "Erro ao gerar o QR Code."})
    return jsonify({"status": "error", "message": "Erro ao obter o URL do QR Code."})

def gera_qr_code(qr_code_url):
    try:
        # Gera o QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_code_url)
        qr.make(fit=True)

        # Cria a imagem PNG do QR code
        img = qr.make_image(fill_color="black", back_color="white")
        img.save("./static/qr_code.png")
    except Exception as e:
        print(f"Erro ao gerar o QR Code: {e}")

@app.route('/')
def index():
    fetch_qr_content()
    return render_template('index.html')

def rabbitmq_consumer():
    def callback(ch, method, properties, body):
        global global_menuVez, global_hermanos, global_fisk
        message = json.loads(body)
        message_body = message.get('body', None)  # O método .get evita erros se a chave 'body' não existir
        data = message.get('_data', {}) # Acessando _data primeiro
        nome_contato = data.get('notifyName', None) # Agora acessando notifyName dentro de _data
        number = data.get('from', None) # Agora acessando notifyName dentro de _data
        number = number.split('@')[0]
        url = ''
        lenq = ''

        if message_body is not None:
            global global_menuVez, global_hermanos, global_fisk
            response = ''
            saudacoes = [f'Olá {nome_contato}, tudo bem?', f'Oi {nome_contato}, como vai você?', f'Opa {nome_contato}, tudo certo?']
            saudacao = random.choice(saudacoes)
            if (message_body != None and message_body == '\pergunta') or global_menuVez == '\pergunta':
                if global_menuVez == '\pergunta': 
                    response = chat(message_body)
                    global_menuVez = ''
                else:
                    response = 'Por favor digite sua pergunta agora: '
                    global_menuVez = '\pergunta'
            elif message_body != None and message_body == '\imagem' or global_menuVez == '\imagem':
                if global_menuVez == '\imagem': 
                    url = generateImage(message_body)
                    response = message_body
                    global_menuVez = ''
                else:
                    response = 'Descreva a imagem que quer gerar: '
                    global_menuVez = '\imagem'
            elif message_body != None and message_body == '\sobre':
                response = 'Neste projeto, utilizamos o Flask, um micro-framework Python leve e flexível, para construir a API do lado do servidor. Para gerar QR codes, empregamos a biblioteca `qrcode` do Python. A comunicação com o modelo de linguagem GPT-3 da OpenAI é feita através da API da OpenAI, com autenticação gerenciada por variáveis de ambiente armazenadas em um arquivo `.env` para segurança. Além disso, a biblioteca `requests` do Python é usada para realizar chamadas HTTP entre a aplicação Flask e uma API externa Node.js, possibilitando a troca de mensagens.'
            elif message_body != None and message_body == '\humano':
                response = 'Aguarde um momento, o humano virá lhe responder.'
            elif message_body != None and message_body == '\pix':
                print('entrei no pix')
                response = 'Obrigado por ajudar o projeto, segue dados do pix: ifbadavi@gmail.com. Todo valor depositado será convertido em café para os devs envolvidos.'
                url='https://user-images.githubusercontent.com/73002604/282550215-f7b3b8a1-5d6c-4401-a485-5047151b7fde.png'
            elif message_body != None and message_body == '\\nota':
                pass
            elif message_body != None and message_body == '\empresa':
                pass
            elif message_body != None and message_body == '\\fisk':
                global_fisk = True
                global_hermanos = False
                lenq = 'en'
                response = 'Olá mundo!'
            elif message_body != None and message_body == '\hermanos':
                global_hermanos = True
                global_fisk = False
                lenq = 'es'
                response = 'Olá mundo!'
            elif message_body != None and message_body == '\sair':
                if((global_hermanos or global_fisk) and url == ''):
                    translator = GoogleTranslator(source='pt', target=lenq).translate(text=response)
                    response = translator.translate(response)
                send_to_node(number, response, url)
                exit()
            elif message_body != None and message_body != '':
               response = f'{saudacao} Esse é um atendimento automático, e não é monitorado por um humano 🤖. Caso queira falar com um atendente, escolha a opção \humano. \r\n\r\nEscolha uma das opções abaixo para iniciarmos a nossa conversa: \r\n\r\n*[ \pergunta ]* - Quero fazer uma pergunta ao bot. 🙋🏻‍♂️ \r\n*[ \imagem ]* - Gera uma imagem com seus parâmetros. 📷 \r\n*[ \sobre ]* - Quero saber mais sobre este projeto. 👨🏻‍💻 \r\n*[ \humano ]* - Gostaria de falar com o Davizinho 🤏🤴. \r\n*[ \pix ]* - Quero contribuir com o lanche da tarde dos crias.🌭 🍔   \r\n*[ \\nota ]* - Quero atribuir uma nota a este serviço. 👍🏻 👎🏻\r\n*[ \empresa ]* - Gostaria de desenvolver o meu bot empresarial. 📲 \r\n*[ \\fisk ]* - In *ENGLISH* please!☕️ \r\n*[ \hermanos ]* - En *ESPAÑOL* por favor. 🌮'
            
            if response != '' and number != '':
                if((global_hermanos or global_fisk) and url == ''):
                    translator = GoogleTranslator(source='pt', target=lenq).translate(text=response)
                    response = translator.translate(response)
                send_to_node(number, response, url)
        else:
            print("A chave 'body' não existe na mensagem recebida")

    def send_to_node(number, message, url):
        print(number, message, url)
        # Preparar os dados para a API Node
        node_url = ''
        if url == '':
            data = {'number': number, 'message': message}
            node_url = 'http://localhost:8000/send_message'
        else:
            if message != '':
                data = {'number': number, 'file': url, 'caption': message}
            else:
                data = {'number': number, 'file': url, 'caption': 'Imagem gerada por IA'}
            node_url = 'http://localhost:8000/send-media'
        # Enviar requisição para a API Node
        try:
            response = requests.post(node_url, json=data)
            if response.status_code == 200:
                print("Resposta enviada para a fila 'responses'")
            else:
                print(response.json(), response.status_code)
        except requests.exceptions.RequestException as e:
            return print({'status': False, 'message': str(e)}, 500) 

    def generateImage(pergunta):
        try:
            client = OpenAI(
                api_key=os.getenv('OPENAI_API_KEY'),
            )
            response = client.images.generate(
            model="dall-e-3",
            prompt=pergunta,
            size="1024x1024",
            quality="standard",
            n=1,
            )
            return response.data[0].url
        except Exception as e:
            return str(e)

    def chat(pergunta):
        if not pergunta:
            return 'error: Mensagem não fornecida'
        try:
            client = OpenAI(
                # defaults to os.environ.get("OPENAI_API_KEY")
                api_key=os.getenv('OPENAI_API_KEY'),
            )
            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": pergunta,
                    }
                ],
                model="gpt-3.5-turbo",
            )
            print(response)
            return response.choices[0].message.content.strip()
        except Exception as e:
            return str(e)

    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    channel.queue_declare(queue='messages', durable=True)

    channel.basic_consume(queue='messages', on_message_callback=callback, auto_ack=True)

    print('Consumidor RabbitMQ iniciado. Esperando por mensagens...')
    channel.start_consuming()

if __name__ == '__main__':
    # Iniciando o consumidor RabbitMQ em uma thread separada
    threading.Thread(target=rabbitmq_consumer).start()

    app.run(debug=True, use_reloader=False)  # use_reloader=False para evitar duplicação do job com o reloader do Flask
