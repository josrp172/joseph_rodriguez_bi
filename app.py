import os

from flask import Flask, request, jsonify, render_template
from google import genai
import json

app = Flask(__name__)

# Initialize the GenAI client (API key should be kept secret)
client = genai.Client(api_key="AIzaSyCmVExBw1v18vCNcdYzIwTrX00O5_9J3SE")

# Load the entire knowledge.json from the "knowledgebase" folder
knowledge_path = os.path.join('knowledgebase', 'knowledge.json')
try:
    with open(knowledge_path, 'r', encoding='utf-8') as f:
        knowledge_data = json.load(f)
    # Format the knowledge data as a string.
    # Here we use json.dumps with indent for readability.
    persona_context = json.dumps(knowledge_data, indent=2)
    if not persona_context.strip():
        print("Warning: knowledge.json is empty.")
    else:
        print("Loaded knowledge.json context:")
except Exception as e:
    print("Error loading knowledge.json:", e)
    persona_context = ""

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Combine the persona context (full knowledge) with the user's message.
    # You might separate them with a divider for clarity.
    prompt = f"{persona_context}\n\nUser: {user_message}\n\nResponse:"
    print("Prompt sent to AI model:")
    print(prompt)  # Debug print; remove or log properly in production

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return jsonify({"response": response.text})
    except Exception as e:
        print("Error generating AI response:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)