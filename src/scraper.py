import os
import re
import boto3
import instaloader

INSTAGRAM_USERNAME = "frogelectronics"
SESSION_PATH = f"/tmp/session-{INSTAGRAM_USERNAME}"


def fetch_session():
    bucket = os.environ["SESSION_BUCKET"]
    s3 = boto3.client("s3")
    s3.download_file(bucket, f"session-{INSTAGRAM_USERNAME}", SESSION_PATH)


def extract_shortcode(url: str) -> str:
    match = re.search(r'/p/([A-Za-z0-9_-]+)', url)
    if not match:
        raise ValueError(f"Could not extract shortcode from URL: {url}")
    return match.group(1)


def scrape_post(url: str) -> dict:
    if not os.path.exists(SESSION_PATH):
        fetch_session()

    shortcode = extract_shortcode(url)
    L = instaloader.Instaloader(sleep=False)
    L.load_session_from_file(INSTAGRAM_USERNAME, filename=SESSION_PATH)
    post = instaloader.Post.from_shortcode(L.context, shortcode)
    return {
        "imageUrl": post.url,
        "caption": post.caption or "",
    }
