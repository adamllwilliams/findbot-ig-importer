import json
from unittest.mock import MagicMock, patch
import pytest

from src.gen_ai import extract_event_data

MOCK_EVENT_DATA = {
    "title": "Test Event",
    "description": "Test description",
    "start_datetime": "2026-05-23T16:00:00",
    "venue": "The Golden Lion",
}


def make_mock_response(data):
    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": json.dumps(data)}]}}]
    }
    return mock_response


@patch("src.gen_ai.requests.get")
@patch("src.gen_ai.requests.post")
def test_returns_event_data_on_happy_path(mock_post, mock_get, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    mock_get.return_value = MagicMock(content=b"fake-image-data")
    mock_post.return_value = make_mock_response(MOCK_EVENT_DATA)

    result = extract_event_data("https://cdn.instagram.com/image.jpg", "Test caption")

    assert result["title"] == "Test Event"
    assert result["venue"] == "The Golden Lion"
    assert result["start_datetime"] == "2026-05-23T16:00:00"


@patch("src.gen_ai.requests.get")
@patch("src.gen_ai.requests.post")
def test_raises_if_gemini_request_fails(mock_post, mock_get, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    mock_get.return_value = MagicMock(content=b"fake-image-data")
    mock_post.return_value = MagicMock(raise_for_status=MagicMock(side_effect=Exception("Gemini API error")))

    with pytest.raises(Exception, match="Gemini API error"):
        extract_event_data("https://cdn.instagram.com/image.jpg", "Test caption")


@patch("src.gen_ai.requests.get")
@patch("src.gen_ai.requests.post")
def test_raises_if_response_text_is_invalid_json(mock_post, mock_get, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    mock_get.return_value = MagicMock(content=b"fake-image-data")
    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": "not valid json"}]}}]
    }
    mock_post.return_value = mock_response

    with pytest.raises(Exception):
        extract_event_data("https://cdn.instagram.com/image.jpg", "Test caption")


@patch("src.gen_ai.requests.get")
@patch("src.gen_ai.requests.post")
def test_omits_image_part_if_image_url_empty(mock_post, mock_get, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    mock_post.return_value = make_mock_response(MOCK_EVENT_DATA)

    extract_event_data("", "Test caption")

    payload = mock_post.call_args[1]["json"]
    parts = payload["contents"][0]["parts"]
    assert all("inline_data" not in part for part in parts)
    mock_get.assert_not_called()


@patch("src.gen_ai.requests.get")
@patch("src.gen_ai.requests.post")
def test_image_is_base64_encoded_in_request(mock_post, mock_get, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    mock_get.return_value = MagicMock(content=b"fake-image-data")
    mock_post.return_value = make_mock_response(MOCK_EVENT_DATA)

    extract_event_data("https://cdn.instagram.com/image.jpg", "Test caption")

    payload = mock_post.call_args[1]["json"]
    image_part = payload["contents"][0]["parts"][0]
    assert "inline_data" in image_part
    assert image_part["inline_data"]["mime_type"] == "image/jpeg"
