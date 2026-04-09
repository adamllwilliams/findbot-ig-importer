import json
from unittest.mock import patch
import pytest

from src.handler import import_post


def make_event(url=None):
    return {"queryStringParameters": {"url": url} if url else {}}


MOCK_SCRAPED = {"imageUrl": "https://cdn.instagram.com/image.jpg", "caption": "Test caption"}
MOCK_EVENT_DATA = {
    "title": "Test Event",
    "description": "Test description",
    "start_datetime": "2026-05-23T16:00:00",
    "venue": "The Golden Lion",
}


@patch("src.handler.extract_event_data")
@patch("src.handler.scrape_post")
def test_returns_400_if_url_missing(mock_scrape, mock_extract):
    result = import_post(make_event(), {})
    assert result["statusCode"] == 400
    assert json.loads(result["body"])["error"] == "Missing required query parameter: url"


@patch("src.handler.extract_event_data")
@patch("src.handler.scrape_post")
def test_returns_200_on_happy_path(mock_scrape, mock_extract):
    mock_scrape.return_value = MOCK_SCRAPED
    mock_extract.return_value = MOCK_EVENT_DATA

    result = import_post(make_event("https://www.instagram.com/p/ABC123/"), {})

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["title"] == "Test Event"
    assert "_timing" in body


@patch("src.handler.extract_event_data")
@patch("src.handler.scrape_post")
def test_returns_500_if_scrape_post_raises(mock_scrape, mock_extract):
    mock_scrape.side_effect = Exception("Instaloader error")

    result = import_post(make_event("https://www.instagram.com/p/ABC123/"), {})

    assert result["statusCode"] == 500
    assert json.loads(result["body"])["error"] == "Instaloader error"


@patch("src.handler.extract_event_data")
@patch("src.handler.scrape_post")
def test_returns_500_if_extract_event_data_raises(mock_scrape, mock_extract):
    mock_scrape.return_value = MOCK_SCRAPED
    mock_extract.side_effect = Exception("Gemini API error")

    result = import_post(make_event("https://www.instagram.com/p/ABC123/"), {})

    assert result["statusCode"] == 500
    assert json.loads(result["body"])["error"] == "Gemini API error"
