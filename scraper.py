#!/usr/bin/env python3
import sys
import json
import re
import instaloader

def extract_shortcode(url: str) -> str:
    match = re.search(r'/p/([A-Za-z0-9_-]+)', url)
    if not match:
        raise ValueError(f"Could not extract shortcode from URL: {url}")
    return match.group(1)

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 scraper.py <instagram_post_url>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    shortcode = extract_shortcode(url)

    L = instaloader.Instaloader(sleep=False)
    L.load_session_from_file("frogelectronics")

    post = instaloader.Post.from_shortcode(L.context, shortcode)

    result = {
        "imageUrl": post.url,
        "caption": post.caption or "",
    }

    print(json.dumps(result))

if __name__ == "__main__":
    main()
