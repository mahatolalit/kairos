# Message Retrieval Performance Optimizations

This document outlines the indexing and query optimizations added for message retrieval.

## What changed
- Added a `conversationKey` field (stable unordered pair of participants) to `Message` documents.
- Added indexes:
  - `{ conversationKey: 1, _id: -1 }` (primary)
  - `{ senderId: 1, receiverId: 1, _id: -1 }` and `{ receiverId: 1, senderId: 1, _id: -1 }` (transitional for existing `$or` queries)
- Optimized the read path to use `lean()` and a narrow projection.
- Optional keyset pagination via `limit` and `beforeId` without breaking existing API consumers.

## Migration (Backfill)
1. Ensure `MONGODB_URI` is configured (same as the app).
2. Run the backfill script:
   ```bash
   cd backend
   npm run backfill:conversationKey
   ```
3. Verify indexes are present and being used:
   ```js
   db.messages.getIndexes();
   db.messages.find({ conversationKey: "<a>_<b>" }).sort({ _id: -1 }).explain("executionStats");
   ```

## Measuring impact
- Use `explain("executionStats")` to compare `totalKeysExamined`, `totalDocsExamined`, and `executionTimeMillis` before/after.
- Load test the GET `/api/messages/:id` endpoint (Artillery, k6) and track P95/P99 latencies.

## Notes
- Response remains an array for backward compatibility. When paginating, results are returned in chronological order, while the query uses a descending `_id` index for efficiency and reverses in-memory.
- The legacy `$or` path remains as a fallback to avoid regressions prior to running the backfill.
