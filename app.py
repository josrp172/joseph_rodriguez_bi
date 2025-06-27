import re

import eventlet
eventlet.monkey_patch()

import os
import time

from flask import Flask, request, jsonify, render_template, send_from_directory
from google import genai
import json
from flask_socketio import SocketIO, emit
import firebase_admin
from firebase_admin import credentials, db as firebase_db
import threading


FIREBASE_SERVICE_ACCOUNT_JSON = """
{
  "type": "service_account",
  "project_id": "sephquiz",
  "private_key_id": "ff8269373a19d4f48ec344441b12a8961a7b3a67",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCrOmj/9YbTh/K0\\nmVLzM69ARIg0lEDryE3OihnbU9/YepRbuQcSmN2sCxVyQVzG5xg7AW+MIqKVVkR9\\ny9rnEZGCcnN9ZwyCFvShovt7dDF7Ej75YC6IlqDoktAKlVE4ugE9CeH3WtFuRTDW\\nxL6n91SIL7trH+dgFcEFzFq63+pKNoDHGDY6/oCtYKxjCjSBFU5RN0Ky4swTKIZl\\n03bmFsbXNpTdRaLj7/sXNQpDxjWm4AaLFAN6LVw5eMRuRkOTUEBWm1cyArT/SpT5\\nhoHAaAGbyWlmK7maZFUs2gVJjT0INjhQIBphwY9FEcj+OczzPL1bSPi4YAwqaPEG\\nK0ABH8CBAgMBAAECggEAKPPi6hkUoqIYw+YJ5138s9/QPdcZgesZ5OS103XHi3Sh\\n6CAkV2fVWNEb04Rbhrz92Br7TWZ5QUNtRTMNC4fxp+PsyFjtrm2EG+apxDihnwBZ\\nrHY7GvL/0DBQ7r8QuoMOScWD1I/VmEyXJj7PJMgsYRgdeL0cLyh0zoi2SIzGcfIb\\nd+26mweQ2ZfPGA7YNvwLhrbNNtnNEzrzhQ5j+A1RCuHNgzPdObWwuFcR/ICsQ2mZ\\nzQgh9MegqeoIHhYxG7th7ZX6YSWKNTAoqFOfe2IBb+Jd/rnzsNSvG8R/9oHceZ3b\\nyuKkSUTwUysLDKmdwdHdm0dkMdeghaqnE0MFD3vGOQKBgQDpDcs3cN7Y/yBEKpnx\\n+NU7vFWSbut/JHkIs1pD2w4+ouiKmZttq2En5cxrWZz4kvq78JPyhbSorCDfgIE4\\n8RoMP9NkMjwK/bqIzanQ51KBIjXeO85i44K5o18u23LaIUUyU377LjRxmvTVq/QS\\nDgbCTOu9+JRFYfmo93DNUr0mfQKBgQC8FkbveUz4h+rMa8nDrq8bdktJMsJ9yjDO\\nRbGilc/hztnzvfZ9J7iBjCujkXU+nI7dpAPPg1Yo2Ye272oI9fjMuxXKEYW4otZ3\\nczR4vx/C7sN0zhrC+e93a0WEZrUaJGs5C7BVI95b8iHhF1neeeoBFJIKT+Po3RNo\\nl8EheiYtVQKBgAlRH9qrjH0oVeXjvhvKUtv8f39HJ+sBTkVmxikITN18Lce8tFYC\\nD/REX5O7FWdqmNOCnqeHaN2FZBsLTB82pE/xDUZoK7ZUxmxJrIxJcybuczDbOzkA\\n120MdvWsmD7YLagBZoYsJrST+U3BfhRqsyJ5aMNDeMn9TLnQipXqxN0RAoGBAJrw\\ncwDk2M5HENnS1UOYi/FAcmZbJTKAM9JIQTug0729K3gJfZq99NTrBivZME8iouHc\\nMbNpCrnd8Fl3Qc8d6RWl7B4obxKZObjus0PglaZ8D5ESE6OYRncGbB7UiM1/QMCe\\na2THhm4RuWz2Unbd0TGQo3lRNHroWwunL1aHjBl9AoGBANZboIp0U2v6eLSzYuMS\\nWAygZs4WSoLIDPdF9qHq47E+aDrguSF0YVcro+uulAnfAAgr0Dr8/mYWg34RVfui\\n6aFbqsKWtgqCIsw4B4BCg3pUpH9O/PAzLyk+G6MW6QG9tJNe4wHrLGsKTYL4TKUa\\nx1KaJbYpPhkKfxxrQTsEoA7o\\n-----END PRIVATE KEY-----\\n",
  "client_email": "firebase-adminsdk-fbsvc@sephquiz.iam.gserviceaccount.com",
  "client_id": "115779035183545381373",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sephquiz.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
"""
FIREBASE_DB_URL = 'https://sephquiz-default-rtdb.asia-southeast1.firebasedatabase.app'

if not firebase_admin._apps:
    cred = credentials.Certificate(json.loads(FIREBASE_SERVICE_ACCOUNT_JSON))
    firebase_admin.initialize_app(cred, {'databaseURL': FIREBASE_DB_URL})

questions = [
    {"id": 1, "question": "What is 2 + 2?", "choices": ["2", "3", "4", "5"], "answer": "4"},
    {"id": 2, "question": "Capital of France?", "choices": ["London", "Paris", "Rome", "Madrid"], "answer": "Paris"},
]
player_scores = {}  # {username: score}
participants = {}
last_gif_time = {}
disconnect_timers = {}  # sid: timer object

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


@app.route('/quiz/generate_auto', methods=['POST'])
def quiz_generate_auto():
    data = request.get_json()
    form_name = data.get('formName', '').strip()
    extra_notes = data.get('extraNotes', '').strip()
    categories = data.get('categories', [])
    num_questions = int(data.get('numQuestions', 5))  # Ensure integer!
    quiz_types = data.get('quizTypes', [])
    per_type_difficulties = data.get('perTypeDifficulties', {})
    timer = data.get('timer', 30)
    randomize = data.get('randomize', True)
    allow_multiple_answers = data.get('allowMultipleAnswers', False)

    # Load your Gemini prompt template
    prompt_path = 'static/quiz/gemini_quiz_generation.txt'
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt_template = f.read()

    # Format the parameters for Gemini
    param_lines = []
    if form_name:
        param_lines.append(f"- Form Name: {form_name}")
    param_lines.append(f"- Categories: {', '.join(categories)}")
    param_lines.append(f"- Number of Questions: {num_questions}")
    param_lines.append(f"- Quiz Types: {', '.join(quiz_types)}")
    param_lines.append(f"- Difficulty per Type:")
    for k, v in per_type_difficulties.items():
        param_lines.append(f"    - {k}: {v}")
    param_lines.append(f"- Time per Question: {timer} seconds")
    opt_line = "randomize order" if randomize else ""
    opt_line += ", allow multiple answers" if allow_multiple_answers else ", do not allow multiple answers"
    param_lines.append(f"- Options: {opt_line}")
    if extra_notes:
        param_lines.append(f"- Notes: {extra_notes}")

    param_block = "\n".join(param_lines)

    # Combine with your template (up to the parameter section)
    before_params = prompt_template.split("Now, using the following parameters, generate a new quiz set:")[0]
    prompt = (
        f"{before_params}"
        f"Now, using the following parameters, generate a new quiz set:\n{param_block}\n\n"
        f"Each question should be creative, clear, and match the requested category, type, and difficulty.\n\n"
        f"Return ONLY the JSON array."
    )

    # Helper: Extract first JSON array
    def extract_json_array_loose(text):
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        start = text.find('[')
        end = text.rfind(']')
        if start != -1 and end != -1 and end > start:
            return text[start:end + 1]
        raise ValueError("No valid JSON array found.")

    # Call Gemini API
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        content = response.text.strip()
        json_str = extract_json_array_loose(content)
        quiz_questions = json.loads(json_str)
        # Validation: Must be a list, correct length
        if not isinstance(quiz_questions, list):
            raise ValueError("Quiz data is not a JSON array.")
        if len(quiz_questions) != num_questions:
            raise ValueError(f"Generated only {len(quiz_questions)} out of {num_questions} questions.")
    except Exception as e:
        print("Gemini/JSON error:", e)
        return jsonify({'success': False, 'error': f'Quiz generation error: {str(e)}'}), 500

    # Save to Firebase
    try:
        quiz_id = f"quiz_{int(time.time())}"
        ref = firebase_db.reference(f"/generated_quizzes/{quiz_id}")
        ref.set({
            "meta": {
                "formName": form_name,
                "categories": categories,
                "numQuestions": num_questions,
                "quizTypes": quiz_types,
                "perTypeDifficulties": per_type_difficulties,
                "timer": timer,
                "randomize": randomize,
                "allowMultipleAnswers": allow_multiple_answers,
                "createdAt": int(time.time()),
                "extraNotes": extra_notes
            },
            "questions": quiz_questions
        })
    except Exception as e:
        print("Firebase error:", e)
        return jsonify({'success': False, 'error': f'Firebase error: {str(e)}'}), 500

    return jsonify({'success': True, 'quiz_id': quiz_id, 'questions': quiz_questions})


@app.route('/quiz/set_selected_questionnaire', methods=['POST'])
def set_selected_questionnaire():
    data = request.get_json()
    questionnaire_id = data.get('questionnaire_id')
    if not questionnaire_id:
        return jsonify({'success': False, 'error': 'Missing questionnaire_id'}), 400
    try:
        ref = firebase_db.reference('/selected_questionnaire')
        ref.set({'id': questionnaire_id, 'timestamp': int(time.time())})
        # FIX: Just emit, do NOT include broadcast=True
        socketio.emit('selected_questionnaire_updated', {'id': questionnaire_id})
        return jsonify({'success': True})
    except Exception as e:
        print("Firebase set_selected_questionnaire error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500


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

@app.route('/quiz/loading_screen')
def quiz_loading_screen():
    return render_template('quizziz/quiz_loading_screen.html')

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

@app.route('/quiz/quiz_generate_form')
def quiz_generate_form():
    return render_template('quizziz/quiz_generate_form.html')


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
    return render_template('quizziz/form/quiz_reorder.html')

@app.route('/quiz/form/categorize')
def quiz_categorize():
    return render_template('quizziz/form/quiz_categorize.html')

@app.route('/quiz/form/target_shooter')
def quiz_target_shooter():
    return render_template('quizziz/form/quiz_target_shooter.html')

@app.route('/quiz/form/memory_match')
def quiz_memory_match():
    return render_template('quizziz/form/quiz_memory_match.html')

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
    total = data.get('total', 0)
    progress = data.get('progress', 0)
    sid = request.sid

    # Cancel pending disconnect removal if it exists
    if sid in disconnect_timers:
        # Eventlet tasks can't be "killed" so just drop reference (it will check sid later)
        disconnect_timers.pop(sid, None)

    # Remove any previous participants with the same name (de-duplication logic)
    for old_sid, p in list(participants.items()):
        if p['name'] == name and old_sid != sid:
            # Also remove their pending timer if exists
            disconnect_timers.pop(old_sid, None)
            participants.pop(old_sid, None)

    # Add or update this participant
    participants[sid] = {
        'id': sid,
        'name': name,
        'avatar': avatar,
        'progress': progress
    }
    player_scores[sid] = total

    broadcast_player_list()

@app.route('/quiz/final_ranking')
def quiz_final_ranking():
    return render_template('quizziz/quiz_final_ranking.html')


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
    sid = request.sid

    # Start a delayed removal, but cancel if they reconnect
    def delayed_remove():
        eventlet.sleep(20)  # Wait 20 seconds before removal!
        # Only remove if they haven't rejoined
        if sid in participants:
            participants.pop(sid, None)
            broadcast_player_list()

    disconnect_timers[sid] = socketio.start_background_task(delayed_remove)

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

@socketio.on('admin_reset_scores')
def handle_admin_reset_scores():
    global player_scores
    # Zero scores but don't touch participants
    for user_id in player_scores:
        player_scores[user_id] = 0
    # Broadcast updated leaderboard (or send your normal update event)
    emit('update_leaderboard', player_scores, broadcast=True, namespace='/admin')
    emit('scores_reset', broadcast=True)  # Notify all admins if needed

@socketio.on('admin_reset_all')
def handle_admin_reset_all():
    global player_scores, participants
    player_scores.clear()
    participants.clear()
    # Let all users know they need to return to the entry screen
    emit('force_leave', broadcast=True)
    # Optionally, update admin dashboards
    emit('update_leaderboard', player_scores, broadcast=True, namespace='/admin')
    emit('all_reset', broadcast=True)


@socketio.on('admin_get_players')
def handle_admin_get_players():
    broadcast_player_list()


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
    gif_name = data.get('gif')
    name = data.get('name')
    avatar = data.get('avatar')
    sid = request.sid

    now = time.time()
    popup_duration = 5  # Match your JS animation time

    # Block if GIF already sent in last 2.5 seconds
    if sid in last_gif_time and now - last_gif_time[sid] < popup_duration:
        # Optionally: emit error to just this user
        emit('gif_error', {'msg': 'Wait for your last GIF to finish!'})
        return
    last_gif_time[sid] = now

    socketio.emit('show_gif', {
        'gif': gif_name,
        'name': name,
        'avatar': avatar
    })

@socketio.on('submit_score')
def on_score(data):
    player_scores[request.sid] = data['total']
    if request.sid in participants:
        participants[request.sid]['progress'] = data.get('progress', participants[request.sid].get('progress', 0))
    broadcast_player_list()

def broadcast_player_list():
    lst = []
    for sid, info in participants.items():
        lst.append({
            'id':    sid,
            'name':  info['name'],
            'avatar': info['avatar'],
            'score': player_scores.get(sid, 0),
            'progress': info.get('progress', 0)
        })
    emit('player_list', lst, broadcast=True)





if __name__ == '__main__':
    socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
