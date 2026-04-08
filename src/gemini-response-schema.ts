import { Type } from '@google/genai';

export const geminiResponseSchema = {
    type: Type.OBJECT,
    required: ["title", "description", "start_datetime"],
    properties: {
    title: {
        type: Type.STRING,
        description: "Event title",
    },
    description: {
        type: Type.STRING,
        description: "Event description in 140 characters or less",
    },
    start_datetime: {
        type: Type.STRING,
        description: "Event start date and time in local UK time. If time is known use YYYY-MM-DDTHH:MM:SS format. If only the date is known use YYYY-MM-DD format.",
        pattern: '^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2})?$',
    },
    end_datetime: {
        type: Type.STRING,
        description: "Event end date and time in local UK time. Only include if explicitly stated in the post.",
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$',
    },
    venue: {
        type: Type.STRING,
        description: "Venue or location name. Only include if explicitly stated in the post.",
    },
    },
};