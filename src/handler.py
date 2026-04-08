import json
from scraper import scrape_post


def import_post(event):
    try:
        params = event.get("queryStringParameters") or {}
        url = params.get("url")

        if not url:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required query parameter: url"}),
            }

        result = scrape_post(url)

        return {
            "statusCode": 200,
            "body": json.dumps(result),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }
