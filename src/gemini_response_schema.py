gemini_response_schema = {
    "type": "OBJECT",
    "required": ["title", "description", "start_datetime"],
    "properties": {
        "title": {
            "type": "STRING",
            "description": "Event title.",
        },
        "description": {
            "type": "STRING",
            "description": "Event description in 140 characters or less.",
        },
        "start_datetime": {
            "type": "STRING",
            "description": (
                "Event start date and time in local UK time. "
                "If time is known use YYYY-MM-DDTHH:MM:SS format. "
                "If only the date is known use YYYY-MM-DD format."
            ),
            "pattern": r"^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$",
        },
        "end_datetime": {
            "type": "STRING",
            "description": (
                "Event end date and time in local UK time. "
                "Only include if explicitly stated."
            ),
            "pattern": r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$",
        },
        "venue": {
            "type": "STRING",
            "description": "Venue or location name. Only include if explicitly stated.",
        },
    },
}
