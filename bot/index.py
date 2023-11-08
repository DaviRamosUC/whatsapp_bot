from flask import Flask, render_template, request, jsonify
import qrcode
import requests
import time

app = Flask(__name__)

@app.route('/')
def index():

    # Function to make a GET request and fetch the QR code content
    def fetch_qr_content():
        url = "http://localhost:8000/status"
        while True:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "successo":
                    return data.get("url")
                elif data.get("status") == 0:
                    continue
                elif data.get("status") == 1:
                    url = "http://localhost:8000/qr-code"
                elif data.get("status") == 3:
                    break
            elif response.status_code == 404:
                # If 404, wait for a second and then retry
                time.sleep(1)
        return None

    # Fetch QR code content
    qr_content = fetch_qr_content()

    # Generating and saving QR code as PNG if content is fetched
    if qr_content:
        try:
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_content)
            qr.make(fit=True)

            # Create a PNG file
            img = qr.make_image(fill_color="black", back_color="white")
            img.save("./static/qr_code.png")

            return render_template('index.html')
        except Exception as e:
            return render_template('error.html')
    else:
        result = "Failed to fetch QR code content."

@app.route('/conectado', methods=['POST'])
def conectado():
    # Logic for connected
    data = request.json  # This will be the JSON data sent with the POST request
    return jsonify({"status": "connected", "data": data}), 200

@app.route('/mensagem', methods=['POST'])
def mensagem():
    # Logic for message
    message = request.json  # This will be the JSON data sent with the POST request
    return jsonify({"status": "message received", "message": message}), 200

if __name__ == '__main__':
    app.run(debug=True)
