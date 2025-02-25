from flask import Flask, request, jsonify, render_template
from google import genai

app = Flask(__name__)

# Initialize the GenAI client (API key should be kept secret)
client = genai.Client(api_key="AIzaSyCmVExBw1v18vCNcdYzIwTrX00O5_9J3SE")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Use Gemini to generate content based on the user message
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_message
        )
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)