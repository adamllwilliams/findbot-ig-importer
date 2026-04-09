import base64
import json
import os

import requests

from src.gemini_response_schema import gemini_response_schema

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent"


def extract_event_data(image_url: str, caption: str) -> dict:
    image_data = base64.b64encode(requests.get(image_url, timeout=10).content).decode("utf-8")

    prompt = (
        "This is an Instagram post promoting an event. "
        "Extract structured event details from the image and caption below. "
        "Use UK local time for all datetimes. Omit fields not explicitly stated.\n\n"
        f"--- INSTAGRAM CAPTION ---\n{caption}\n--- END INSTAGRAM CAPTION ---"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"inline_data": {"mime_type": "image/jpeg", "data": image_data}},
                    {"text": prompt},
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "response_schema": gemini_response_schema,
            "thinking_config": {"thinking_budget": 0},
        },
    }

    response = requests.post(
        GEMINI_API_URL,
        params={"key": os.environ["GEMINI_API_KEY"]},
        json=payload,
        timeout=30,
    )
    response.raise_for_status()

    return json.loads(response.json()["candidates"][0]["content"]["parts"][0]["text"])
