import os
from typing import Any, Dict, List, Optional

import httpx
from mcp.server.fastmcp import FastMCP

DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"

mcp = FastMCP("openai")


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def _base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", DEFAULT_OPENAI_BASE_URL).rstrip("/")


def _extract_output_text(data: Dict[str, Any]) -> str:
    output_text = data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    parts: List[str] = []
    for item in (data.get("output") or []):
        if not isinstance(item, dict):
            continue
        for content in (item.get("content") or []):
            if not isinstance(content, dict):
                continue
            if content.get("type") == "output_text" and isinstance(content.get("text"), str):
                parts.append(content["text"])

    if parts:
        return "".join(parts)

    # Fallback for chat.completions-like responses
    choices = data.get("choices")
    if isinstance(choices, list) and choices:
        first = choices[0]
        if isinstance(first, dict):
            msg = first.get("message")
            if isinstance(msg, dict) and isinstance(msg.get("content"), str):
                return msg["content"]

    return str(data)


async def _openai_request(method: str, path: str, json_body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    api_key = _require_env("OPENAI_API_KEY")
    url = f"{_base_url()}{path}"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(60.0, connect=10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.request(method, url, headers=headers, json=json_body)

    try:
        data = resp.json()
    except Exception:
        text = resp.text
        raise RuntimeError(f"OpenAI API returned non-JSON ({resp.status_code}): {text[:500]}")

    if resp.status_code >= 400:
        err = data.get("error", data)
        raise RuntimeError(f"OpenAI API error ({resp.status_code}): {err}")

    if not isinstance(data, dict):
        raise RuntimeError(f"OpenAI API returned unexpected JSON type: {type(data)}")

    return data


def _responses_input(prompt: str, system_prompt: str) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []

    if system_prompt:
        items.append(
            {
                "role": "system",
                "content": [{"type": "input_text", "text": system_prompt}],
            }
        )

    items.append(
        {
            "role": "user",
            "content": [{"type": "input_text", "text": prompt}],
        }
    )

    return items


@mcp.tool()
async def openai_response(
    prompt: str,
    model: str = "gpt-4.1-mini",
    system_prompt: str = "",
    temperature: Optional[float] = None,
    max_output_tokens: Optional[int] = None,
) -> str:
    body: Dict[str, Any] = {
        "model": model,
        "input": _responses_input(prompt=prompt, system_prompt=system_prompt),
    }
    if temperature is not None:
        body["temperature"] = temperature
    if max_output_tokens is not None:
        body["max_output_tokens"] = max_output_tokens

    data = await _openai_request("POST", "/responses", json_body=body)
    return _extract_output_text(data)


@mcp.tool()
async def openai_response_json(
    prompt: str,
    model: str = "gpt-4.1-mini",
    system_prompt: str = "",
    temperature: Optional[float] = None,
    max_output_tokens: Optional[int] = None,
) -> Dict[str, Any]:
    body: Dict[str, Any] = {
        "model": model,
        "input": _responses_input(prompt=prompt, system_prompt=system_prompt),
    }
    if temperature is not None:
        body["temperature"] = temperature
    if max_output_tokens is not None:
        body["max_output_tokens"] = max_output_tokens

    return await _openai_request("POST", "/responses", json_body=body)


@mcp.tool()
async def openai_list_models() -> List[str]:
    data = await _openai_request("GET", "/models")
    models = data.get("data")
    if not isinstance(models, list):
        raise RuntimeError("OpenAI /models response did not include a 'data' array")

    ids: List[str] = []
    for item in models:
        if isinstance(item, dict) and isinstance(item.get("id"), str):
            ids.append(item["id"])

    return sorted(set(ids))


if __name__ == "__main__":
    mcp.run()
