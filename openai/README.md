# OpenAI MCP server (Python)

This is a minimal Model Context Protocol (MCP) server that exposes a few OpenAI API tools over MCP stdio.

## Tools

- `openai_response(prompt, model, system_prompt, temperature, max_output_tokens)` -> string
- `openai_response_json(...)` -> full JSON response
- `openai_list_models()` -> list of model ids

## Environment

- `OPENAI_API_KEY` (required)
- `OPENAI_BASE_URL` (optional, default: `https://api.openai.com/v1`)

## Run (local)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:OPENAI_API_KEY = "..."
python server.py
```

## Run (Docker)

```powershell
docker build -t mcp-openai ./openai
docker run -it --rm -e OPENAI_API_KEY="..." mcp-openai
```

## docker-compose snippet

```yaml
mcp-openai:
  build: ./openai
  container_name: mcp-openai
  stdin_open: true
  tty: true
  environment:
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - OPENAI_BASE_URL=${OPENAI_BASE_URL}
```
