import { getGoogleAccessToken } from "@/connectors/googleAuth";

export interface CalendarConnector {
  findEventByTitle(title: string): Promise<{ id: string; htmlLink: string } | null>;
  createEvent(params: {
    summary: string;
    description: string;
    attendees: string[];
    startIso: string;
    endIso: string;
    timeZone: string;
  }): Promise<{ id: string; htmlLink: string }>;
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

class CalendarLiveConnector implements CalendarConnector {
  async findEventByTitle(title: string): Promise<{ id: string; htmlLink: string } | null> {
    const accessToken = await getGoogleAccessToken();
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`);
    url.searchParams.set("q", title);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("timeMin", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString());

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`Calendar events.list failed: ${JSON.stringify(body)}`);
    }
    const match = (body.items ?? []).find(
      (event: { summary?: string; status?: string }) =>
        event.summary?.toLowerCase() === title.toLowerCase() && event.status !== "cancelled"
    );
    return match ? { id: match.id, htmlLink: match.htmlLink } : null;
  }

  async createEvent(params: {
    summary: string;
    description: string;
    attendees: string[];
    startIso: string;
    endIso: string;
    timeZone: string;
  }): Promise<{ id: string; htmlLink: string }> {
    const accessToken = await getGoogleAccessToken();
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: params.summary,
          description: params.description,
          start: { dateTime: params.startIso, timeZone: params.timeZone },
          end: { dateTime: params.endIso, timeZone: params.timeZone },
          attendees: params.attendees.map((email) => ({ email })),
        }),
      }
    );
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`Calendar events.insert failed: ${JSON.stringify(body)}`);
    }
    return { id: body.id, htmlLink: body.htmlLink };
  }
}

export function getCalendarConnector(): CalendarConnector {
  return new CalendarLiveConnector();
}
