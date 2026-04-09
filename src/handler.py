import json
import time

from src.gen_ai import extract_event_data
from src.scraper import scrape_post


def import_post(event, context):
    try:
        params = event.get("queryStringParameters") or {}
        url = params.get("url")

        if not url:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required query parameter: url"}),
            }

        timing = {}
        t_start = time.perf_counter()

        t = time.perf_counter()
        scraped = scrape_post(url)
        timing["scrape_ms"] = round((time.perf_counter() - t) * 1000)

        t = time.perf_counter()
        event_data = extract_event_data(scraped["imageUrl"], scraped["caption"])
        timing["gemini_ms"] = round((time.perf_counter() - t) * 1000)

        timing["total_ms"] = round((time.perf_counter() - t_start) * 1000)

        return {
            "statusCode": 200,
            "body": json.dumps({**event_data, "_timing": timing}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }
