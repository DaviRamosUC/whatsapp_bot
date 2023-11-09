from flask import Flask, render_template, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import qrcode
import requests
import time
import threading
import pika
import json

app = Flask(__name__)
scheduler = BackgroundScheduler()

# Function to make a GET request and fetch the QR code content
def fetch_qr_content():
    fetch_status = "http://localhost:8000/status"
    fetch_qr_code = "http://localhost:8000/qr-code"
    
    response = requests.get(fetch_status)
    if response.status_code == 200:
        status_data = response.json()
        if status_data.get("status") == 1:
            print('Status 1 recebido, buscando QR Code...')
            response = requests.get(fetch_qr_code)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "successo":
                    qr_code_url = data.get("url")
                    print('QR Code obtido com sucesso')
                    gera_qr_code(qr_code_url)

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
    return render_template('index.html')

def rabbitmq_consumer():
    def callback(ch, method, properties, body):
        message = json.loads(body)
        print("Mensagem recebida do RabbitMQ: ", message)
        # Aqui você pode adicionar a lógica para processar a mensagem e responder

    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    channel.queue_declare(queue='messages', durable=True)

    channel.basic_consume(queue='messages', on_message_callback=callback, auto_ack=True)

    print('Consumidor RabbitMQ iniciado. Esperando por mensagens...')
    channel.start_consuming()

if __name__ == '__main__':
    # Iniciando o consumidor RabbitMQ em uma thread separada
    threading.Thread(target=rabbitmq_consumer).start()

    # Adiciona o job que verifica o status e gera o QR code
    scheduler.add_job(fetch_qr_content, 'interval', seconds=10)
    scheduler.start()
    app.run(debug=True, use_reloader=False)  # use_reloader=False para evitar duplicação do job com o reloader do Flask
