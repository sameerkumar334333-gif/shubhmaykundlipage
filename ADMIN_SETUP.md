# ShubhMay Admin Panel Setup

## 1. Run Supabase schema

1. Go to [Supabase Dashboard](https://yhxbwlhfjznajnnlduwt.supabase.co) → SQL Editor  
2. Paste the contents of `supabase-schema.sql` and run it

## 2. Create your admin user

1. **Supabase Dashboard** → **Authentication** → **Users** → **Add user**
2. Enter email and password (e.g. `admin@shubhmay.com`)
3. Copy the **User UID** (uuid) of the newly created user
4. Go to **SQL Editor** and run:

```sql
INSERT INTO admins (user_id, email) VALUES ('YOUR-USER-UUID-HERE', 'admin@shubhmay.com');
```

Replace `YOUR-USER-UUID-HERE` with the copied UUID.

## 3. Access admin panel

- Local: `http://localhost:PORT/admin.html` or `http://localhost:PORT/admin`
- Production: `https://yoursite.com/admin`

Log in with the email and password you created in step 2.

## 4. (Optional) Run supabase-fix-recursion.sql

If you see "infinite recursion" error: run `supabase-fix-recursion.sql` in SQL Editor.

## 5. (Optional) Run supabase-update.sql

For faster queries: run `supabase-update.sql` to add indexes.

## Events tracked

| Event            | Description                                      |
|------------------|--------------------------------------------------|
| `page_view`      | User landed on metal finder or index             |
| `rashi_selected` | User chose a rashi (payload: rashi, metal)       |
| `cta_click`      | User clicked any upsell/CTA button               |
| `whatsapp_click` | WhatsApp lead – phone captured (payload: phone, rashi, metal) |
| `step_view`      | User viewed a step in the metal finder wizard    |

## Security

- **Anon key** is used in frontend (metal finder, index, admin) — safe to expose
- **Service role key** must **never** be used in frontend — keep it secret
