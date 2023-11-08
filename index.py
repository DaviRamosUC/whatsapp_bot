from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time

# Inicializa o WebDriver
driver = webdriver.Chrome()
driver.get("https://web.whatsapp.com")

# Aguarda o usuário escanear o QR Code
input("Pressione Enter após escanear o QR Code")

# Função para enviar mensagem
def enviar_mensagem(contato, mensagem):
    # Acessa o contato
    busca = driver.find_element(By.XPATH, '//*[@id="side"]/div[1]/div/label/div/div[2]')
    busca.clear()
    busca.send_keys(contato)
    busca.send_keys(Keys.ENTER)

    # Envia a mensagem
    campo_mensagem = driver.find_element(By.XPATH, '//*[@id="main"]/footer/div[1]/div[2]/div/div[2]')
    campo_mensagem.send_keys(mensagem)
    campo_mensagem.send_keys(Keys.ENTER)

# Exemplo de uso
enviar_mensagem('Nome do Contato', 'Olá, essa é uma mensagem automática.')
