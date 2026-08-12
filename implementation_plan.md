# Per-Lawyer Cal.com API Key

## Changes
1. DB: `calComApiKey String?` on `Lawyer`
2. Backend: controllers read key from `req.user → lawyer.calComApiKey`; new `PATCH /api/lawyers/cal-com-key` endpoint
3. Frontend: lawyer calendar shows a "Connect Cal.com" form to enter and save their key
