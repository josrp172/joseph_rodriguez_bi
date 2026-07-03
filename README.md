# Joseph Rodriguez Portfolio

## AI persona configuration

The portfolio chat uses DeepSeek V4 Flash. Set a newly generated key as an environment variable before starting the app:

```powershell
$env:DEEPSEEK_API_KEY="your_new_key"
python app.py
```

In production, add `DEEPSEEK_API_KEY` through the hosting provider's secret/environment settings. Never put a real key in source code, frontend JavaScript, `.env.example`, or a committed file.

For local development, you may instead create an ignored `.env` file containing `DEEPSEEK_API_KEY=...`. The application loads it automatically; shell and hosting environment variables take precedence.

The persona retrieves only the relevant sections from `knowledgebase/resume.json` and `knowledgebase/knowledge.json`, caps conversation history, and uses non-thinking mode to reduce input and output token use.
