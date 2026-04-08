# findbot-ig-importer

A serverless AWS Lambda function that extracts structured event data from a public Instagram post using AI.

## Overview

findbot-ig-importer takes an Instagram post URL, scrapes the post content via Apify, and uses Google Gemini Flash Lite to extract structured event data - title, date, venue and description - returning a clean JSON response ready for import into FindEvents.club.

## Architecture
<div align="center">
  <img src="./diagrams/architecture.drawio.svg" width="400" alt="Architecture Diagram" />
</div>

## Request Lifecycle
<div align="center">
  <img src="./diagrams/request-lifecycle.svg" width="900" alt="Request Lifecycle Diagram" />
</div>

## Known Limitations

- **Image posts only** - Instagram Reels are not currently supported.
- **First image only** - carousel posts default to the first image.
- **Single event extraction** - only one event can be extracted per Instagram post.

## Planned Features

- **CI/CD** - automated testing and deployment pipeline via GitHub Actions, running tests and deploying on every commit in main.
- **FindEvents.club auto-fill** - paste an Instagram post URL into the event submission form and have the fields populated automatically using the extracted event data.
- **Scheduled ingestion** - Findbot runs on a schedule, proactively monitoring Instagram accounts for new event posts.
- **Venue matching** - check extracted venue against venues table, use existing ID or create new.
- **Event deduplication** - check extracted data against existing events before inserting.
- **Dominant colour extraction** - extract dominant colours from the event poster image and return alongside event data, enabling gradient accent strips on FindEvents.club event listings.