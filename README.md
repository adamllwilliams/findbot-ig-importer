## Planned Features

- Scheduled event-driven architecture — Findbot runs on a schedule via SQS + Lambda, proactively ingesting events rather than manual triggering
- Findbot FindEvents.club user — dedicated user account for bot-ingested events
- Reel handling — understand how to process Instagram Reels in addition to image posts
- Caching — avoid re-processing the same post URL
- Input validation — reject non-Instagram URLs early
- Unit tests
- FindTickets.club integration
- Post-Gemini venue matching — check extracted venue against venues table, use existing ID or create new
- Post-Gemini deduplication — check extracted title + start_datetime against existing events before inserting