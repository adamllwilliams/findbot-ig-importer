import base64
import json
import os

import requests
from google.genai import Client
from google.genai.types import Blob, GenerateContentConfig, Part, ThinkingConfig

from src.gemini_response_schema import gemini_response_schema


def extract_event_data(image_url: str, caption: str) -> dict:
    client = Client(api_key=os.environ["GEMINI_API_KEY"])

    image_data = base64.b64encode(requests.get(image_url, timeout=10).content).decode("utf-8")

    prompt = (
        "This is an Instagram post promoting an event. "
        "Extract structured event details from the image and caption below. "
        "Use UK local time for all datetimes. Omit fields not explicitly stated.\n\n"
        f"--- INSTAGRAM CAPTION ---\n{caption}\n--- END INSTAGRAM CAPTION ---"
    )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=[
            Part(inline_data=Blob(mime_type="image/jpeg", data=image_data)),
            prompt,
        ],
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=gemini_response_schema,
            thinking_config=ThinkingConfig(thinking_budget=0),
        ),
    )

    return json.loads(response.text)
