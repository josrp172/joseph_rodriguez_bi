import os
import time

import eventlet
from flask import Flask, request, jsonify, render_template, send_from_directory
from google import genai
import json
from flask_socketio import SocketIO, emit

eventlet.monkey_patch()

questions = [
    {"id": 1, "question": "What is 2 + 2?", "choices": ["2", "3", "4", "5"], "answer": "4"},
    {"id": 2, "question": "Capital of France?", "choices": ["London", "Paris", "Rome", "Madrid"], "answer": "Paris"},
]
player_scores = {}  # {username: score}
participants = {}
last_gif_time = {}

app = Flask(__name__)

socketio = SocketIO(app, async_mode='eventlet')

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

@app.route('/projects-bi')
def projects_bi():
    return render_template('projects-bi.html')

@app.route('/news')
def news():
    return render_template('news.html')



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

@app.route('/games')
def games():
    return render_template('quizziz/game_list.html')

@app.route('/quiz/start')
def quiz_start():
    return render_template('quizziz/quiz_user_initial.html')

@app.route('/quiz/user_lobby')
def quiz_user_lobby():
    return render_template('quizziz/quiz_user_lobby.html')

@app.route('/quiz/countdown')
def quiz_countdown():
    return render_template('quizziz/quiz_countdown.html')

@app.route('/quiz/initial_ranking')
def quiz_initial_ranking():
    return render_template('quizziz/quiz_initial_ranking.html')

@app.route('/quiz/play')
def quiz_play():
    return render_template('quizziz/quiz_questions.html')  # Or whatever the main game page is

@app.route('/quiz/waiting')
def quiz_waiting():
    return render_template('quizziz/quiz_waiting.html')

@app.route('/quiz/form/quiz_multiple_choice')
def quiz_multiple_choice():
    return render_template('quizziz/form/quiz_multiple_choice.html')

@app.route('/quiz/form/quiz_match')
def quiz_match():
    return render_template('quizziz/form/quiz_match.html')

@app.route('/quiz/form/quiz_fill_in_blank')
def quiz_fill_in_blank():
    return render_template('quizziz/form/quiz_fill_in_blank.html')

@app.route('/quiz/form/drag_drop')
def quiz_drag_drop():
    return render_template('quizziz/form/drag_drop.html')

@app.route('/quiz/admin_lobby')
def quiz_admin_lobby():
    join_code = '185620'  # Or random code, or from DB/session
    return render_template('quizziz/quiz_admin_lobby.html', join_code=join_code)

@app.route('/quiz/admin')
def quiz_admin():
    return render_template('quizziz/quiz_admin.html')

@socketio.on('join_waiting')
def on_join_waiting(data):
    name = data.get('name', 'No Name')
    avatar = data.get('avatar', 0)
    # Remove any previous participants with the same name (avoids duplicates)
    for sid, p in list(participants.items()):
        if p['name'] == name:
            del participants[sid]
    participants[request.sid] = {
        'id': request.sid,
        'name': name,
        'avatar': avatar
    }
    emit('player_list', list(participants.values()), broadcast=True)

@socketio.on('update_avatar')
def on_update_avatar(idx):
    if request.sid in participants:
        participants[request.sid]['avatar'] = idx
        emit('player_list', list(participants.values()), broadcast=True)


@socketio.on('update_name')
def on_update_name(name):
    if request.sid in participants:
        participants[request.sid]['name'] = name
        emit('player_list', list(participants.values()), broadcast=True)

@socketio.on('disconnect')
def on_disconnect():
    if request.sid in participants:
        del participants[request.sid]
        emit('player_list', list(participants.values()), broadcast=True)

@socketio.on('submit_answer')
def handle_answer(data):
    username = data['username']
    qid = data['qid']
    choice = data['choice']
    # Check answer
    correct = [q for q in questions if q["id"] == qid][0]["answer"] == choice
    player_scores.setdefault(username, 0)
    if correct:
        player_scores[username] += 1
    emit('update_leaderboard', player_scores, broadcast=True, namespace='/admin')







@socketio.on('admin_get_players')
def handle_admin_get_players():
    emit('player_list', list(participants.values()))

@socketio.on('admin_start_quiz')
def handle_admin_start_quiz():
    emit('quiz_started', broadcast=True)
    # Optionally: emit to a "room" only

# Clear players when server restarts, or add a /reset route for dev/demo

@socketio.on('connect', namespace='/admin')
def admin_connect():
    emit('update_leaderboard', player_scores)


@app.route('/static/images/gif/<filename>')
def serve_gif(filename):
    return send_from_directory('static/images/gif', filename)

@socketio.on('send_gif')
def handle_send_gif(data):
    # data: {'gif': 'deal-with-it.gif', 'name': 'Joseph', 'avatar': 0}
    gif_name = data.get('gif')
    name = data.get('name')
    avatar = data.get('avatar')
    sid = request.sid

    now = time.time()
    # Enforce per-5s limit
    if sid in last_gif_time and now - last_gif_time[sid] < 5:
        emit('gif_error', {'msg': 'Please wait before sending another GIF.'})
        return
    last_gif_time[sid] = now

    socketio.emit('show_gif', {
        'gif': gif_name,
        'name': name,
        'avatar': avatar
    })

if __name__ == '__main__':
    socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
