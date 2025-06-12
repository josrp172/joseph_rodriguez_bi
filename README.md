# Joseph Rodriguez BI Flask App

This project is a small Flask application that serves a personal business intelligence assistant. The app loads knowledge from the `knowledgebase` folder and uses Google GenAI to generate responses.

## Requirements

- Python 3.11 or later
- A Google API key for the GenAI service

## Setup

1. **Create a virtual environment** (recommended):

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure your environment**:

   - Set the `GOOGLE_API_KEY` environment variable with your Google GenAI API key. You can export it directly or place it in a file like `api.env` and load it with a tool such as `dotenv`.
   - Any additional environment variables (e.g., `FLASK_ENV`) can be set here as needed.

## Running the Application

After the environment is configured and dependencies are installed, start the Flask server with:

```bash
python app.py
```

The application will run in development mode on `http://localhost:5000/` by default.

