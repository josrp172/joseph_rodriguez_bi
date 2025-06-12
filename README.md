# Joseph Rodriguez BI Chatbot

This Flask application uses Google's generative AI (Gemini) to provide responses based on information stored in `knowledgebase/knowledge.json`.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set the required environment variable before starting the app:

```bash
export GOOGLE_API_KEY=your_api_key_here
```

The application will fail to start if `GOOGLE_API_KEY` is not set.

3. Run the server:

```bash
python app.py
```

## Environment

You can also create a `.env` file and load it using a tool like `dotenv`. An example file is provided below.


### Sample .env

# Copy this file to .env and fill in your API key
GOOGLE_API_KEY=your_api_key_here

