# ShubhMay – Tracking & Analytics

## Where data goes

- **Supabase**: `analytics_events` table (session_id, page_url, referrer, event_type, payload, user_agent, language).
- **GTM**: `dataLayer` for Google Analytics / other tags (same events where wired).

## Event types

| Event | Page(s) | Payload (common) |
|-------|---------|------------------|
| `page_view` | All | `page`, `title`/`funnel`, UTM*, `session_start_ts` |
| `step_view` | Metal finder, Kundli preview | `step_index`, `step_name`, `funnel` |
| `cta_click` | All | `cta_location`, `cta_label`, `step_index` (if applicable), `page` |
| `rashi_selected` | Metal finder | `rashi`, `metal` |
| `whatsapp_click` | Metal finder | `phone`, `rashi`, `metal`, `rashi_display`, `lead` |
| `kundli_preview_submit` | Kundli preview | `name`, `gender`, `dob`, `tob`, `place` |
| `checkout_start` | Kundli preview, Metal finder | `step`, `destination_url` |

## Enhancements already in place

1. **UTM (first-touch)**  
   On first landing, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` are read from the URL and stored in `sessionStorage`. They are merged into **every** event’s `payload` so you can segment by source/campaign in the admin or in SQL.

2. **Session start time**  
   When a new session is created, `session_start_ts` (epoch ms) is stored and sent in payload. Use it to compute time-to-convert or time-on-funnel per session.

3. **Funnel + step_view**  
   - **Metal finder**: `step_view` on step change (1–5) with `step_name` and `funnel: 'metal_finder'`.  
   - **Kundli preview**: `step_view` for step 1 (form) on load and step 2 (preview) when the report is shown.

4. **Consistent payload**  
   All events from a page include the same attribution (UTM + `session_start_ts`) so funnel and conversion reports can be joined by `session_id` and filtered by UTM.

## Admin panel

- **Overview**: 7-day counts (views, submissions, unlock clicks, CVR, leads, etc.).
- **Submissions / Rashi / Leads / Clicks / Events**: tables + CSV export (last 1000–2000 rows per section).
- **Export**: Top-bar “Export CSV” exports the currently active section.

To see UTM in Supabase, use the `payload` JSONB column, e.g.:

```sql
SELECT payload->>'utm_source' AS utm_source, payload->>'utm_medium' AS utm_medium, COUNT(*)
FROM analytics_events
WHERE event_type = 'checkout_start'
GROUP BY 1, 2;
```

## Optional next steps

- **Scroll depth**: Fire `scroll_depth` (e.g. 25%, 50%, 75%, 100%) on key pages and store in `payload`.
- **Form start**: On first focus or first field change, send `form_start` with `funnel`/`page` to measure form drop-off.
- **Checkout URL with UTM**: Append stored UTM params to `destination_url` when redirecting to checkout so the payment page can attribute by source.
- **Admin UTM filters**: In admin, add filters or a small report by `utm_source` / `utm_medium` from `payload`.
