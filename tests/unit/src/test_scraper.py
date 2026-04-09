from unittest.mock import MagicMock, patch
import pytest

from src.scraper import extract_shortcode, scrape_post


def test_extract_shortcode_valid():
    assert extract_shortcode("https://www.instagram.com/p/ABC123/") == "ABC123"


def test_extract_shortcode_invalid():
    with pytest.raises(ValueError, match="Could not extract shortcode"):
        extract_shortcode("https://www.instagram.com/notapost/")


def make_mock_post(url="https://cdn.instagram.com/image.jpg", caption="Test caption"):
    mock_post = MagicMock()
    mock_post.url = url
    mock_post.caption = caption
    return mock_post


@patch("src.scraper.instaloader.Post")
@patch("src.scraper.instaloader.Instaloader")
@patch("src.scraper.fetch_session")
def test_returns_image_url_and_caption(mock_fetch, mock_instaloader_cls, mock_post_cls):
    mock_post_cls.from_shortcode.return_value = make_mock_post()

    with patch("os.path.exists", return_value=True):
        result = scrape_post("https://www.instagram.com/p/ABC123/")

    assert result["imageUrl"] == "https://cdn.instagram.com/image.jpg"
    assert result["caption"] == "Test caption"


@patch("src.scraper.instaloader.Post")
@patch("src.scraper.instaloader.Instaloader")
@patch("src.scraper.fetch_session")
def test_proceeds_with_caption_only_if_image_url_empty(mock_fetch, mock_instaloader_cls, mock_post_cls):
    mock_post_cls.from_shortcode.return_value = make_mock_post(url="")

    with patch("os.path.exists", return_value=True):
        result = scrape_post("https://www.instagram.com/p/ABC123/")

    assert result["imageUrl"] == ""
    assert result["caption"] == "Test caption"


@patch("src.scraper.instaloader.Post")
@patch("src.scraper.instaloader.Instaloader")
@patch("src.scraper.fetch_session")
def test_proceeds_with_image_only_if_caption_empty(mock_fetch, mock_instaloader_cls, mock_post_cls):
    mock_post_cls.from_shortcode.return_value = make_mock_post(caption=None)

    with patch("os.path.exists", return_value=True):
        result = scrape_post("https://www.instagram.com/p/ABC123/")

    assert result["imageUrl"] == "https://cdn.instagram.com/image.jpg"
    assert result["caption"] == ""


@patch("src.scraper.instaloader.Post")
@patch("src.scraper.instaloader.Instaloader")
@patch("src.scraper.fetch_session")
def test_raises_if_both_image_url_and_caption_empty(mock_fetch, mock_instaloader_cls, mock_post_cls):
    mock_post_cls.from_shortcode.return_value = make_mock_post(url="", caption=None)

    with patch("os.path.exists", return_value=True):
        with pytest.raises(ValueError, match="No image or caption available for event extraction"):
            scrape_post("https://www.instagram.com/p/ABC123/")


@patch("src.scraper.fetch_session")
def test_raises_if_session_fetch_fails(mock_fetch):
    mock_fetch.side_effect = Exception("S3 error")

    with patch("os.path.exists", return_value=False):
        with pytest.raises(Exception, match="S3 error"):
            scrape_post("https://www.instagram.com/p/ABC123/")
