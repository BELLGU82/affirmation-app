# רשימת משימות לפיתוח - Mocha Affirm
## על סמך דוח מצב טכני מלא

**תאריך יצירה:** 2025-01-26  
**בסיס:** PROJECT_AUDIT_REPORT.md

---

## 🔴 עדיפות גבוהה (High Priority)

### Authentication & User Management

- [ ] **AUTH-001:** Implement real authentication system
  - [ ] Replace mock `user_123` with actual user authentication
  - [ ] Add user session management
  - [ ] Add JWT tokens or session-based auth
  - [ ] Update all API endpoints to use authenticated user ID
  - [ ] Add authentication middleware

- [ ] **AUTH-002:** Implement signup endpoint
  - [ ] Create POST `/api/users/signup` endpoint
  - [ ] Save user to database in Signup page
  - [ ] Remove TODO comment from Signup.tsx
  - [ ] Add email validation
  - [ ] Add password hashing (if using passwords)

- [ ] **AUTH-003:** Add user authorization checks
  - [ ] Verify user owns resources before access
  - [ ] Add authorization middleware
  - [ ] Prevent users from accessing other users' data

### Type Safety

- [ ] **TYPE-001:** Add missing TypeScript types
  - [ ] Add `background_music_url` to `UserPreferences` type in `src/shared/types.ts`
  - [ ] Create `UserVoice` type for voice operations
  - [ ] Add types for all API responses
  - [ ] Ensure all database queries return typed results

- [ ] **TYPE-002:** Fix type mismatches
  - [ ] Update `UserPreferencesSchema` to include `background_music_url`
  - [ ] Create `UserVoiceSchema` with Zod validation
  - [ ] Add proper types for custom voice handling

### Input Validation

- [ ] **VALID-001:** Add Zod validation to all API endpoints
  - [ ] Create schemas for user profile updates
  - [ ] Create schemas for preferences updates
  - [ ] Create schemas for voice upload
  - [ ] Create schemas for music upload
  - [ ] Add validation to all POST/PATCH endpoints

- [ ] **VALID-002:** Add file upload validation
  - [ ] Validate file size limits (voice recordings, music files)
  - [ ] Validate file types (audio formats only)
  - [ ] Add max file size checks
  - [ ] Add error handling for oversized files

### Custom Voices Implementation

- [ ] **VOICE-001:** Implement custom voice usage in TTS
  - [ ] Remove fallback to `sarah` for custom voices
  - [ ] Implement voice processing/cloning (or document limitation)
  - [ ] Update `generateSpeech` to handle custom voices
  - [ ] Or remove custom voice feature if not feasible

---

## 🟡 עדיפות בינונית (Medium Priority)

### Database Improvements

- [ ] **DB-001:** Add foreign key constraints
  - [ ] Add FK: `affirmations.user_id` → `users.id`
  - [ ] Add FK: `user_preferences.user_id` → `users.id`
  - [ ] Add FK: `mood_tracking.affirmation_id` → `affirmations.id`
  - [ ] Add FK: `mood_tracking.user_id` → `users.id`
  - [ ] Create migration 4 for FK constraints

- [ ] **DB-002:** Handle orphaned records
  - [ ] Add cleanup script for orphaned R2 files
  - [ ] Add validation before serving files
  - [ ] Add periodic cleanup job (or manual cleanup endpoint)

### Error Handling & Recovery

- [ ] **ERR-001:** Add retry logic for failed API calls
  - [ ] Implement exponential backoff for OpenAI API
  - [ ] Implement retry for Google TTS API
  - [ ] Add retry UI feedback
  - [ ] Handle rate limiting errors gracefully

- [ ] **ERR-002:** Improve error messages
  - [ ] Add user-friendly error messages
  - [ ] Add error codes for different error types
  - [ ] Add error logging
  - [ ] Add error reporting/analytics

### File Management

- [ ] **FILE-001:** Add file cleanup mechanism
  - [ ] Create cleanup endpoint for orphaned files
  - [ ] Add file validation before serving
  - [ ] Add periodic cleanup job
  - [ ] Add file size monitoring

- [ ] **FILE-002:** Add file upload limits
  - [ ] Set max file size for voice recordings (e.g., 10MB)
  - [ ] Set max file size for music files (e.g., 50MB)
  - [ ] Add progress indicators for large uploads
  - [ ] Add upload timeout handling

### Analytics & Monitoring

- [ ] **ANALYTICS-001:** Add mood tracking visualization
  - [ ] Create charts/graphs for mood trends
  - [ ] Add mood history visualization component
  - [ ] Add mood statistics (average, trends)

- [ ] **ANALYTICS-002:** Add usage statistics
  - [ ] Track affirmation generation frequency
  - [ ] Track favorite usage
  - [ ] Track audio playback statistics
  - [ ] Add dashboard for user insights

---

## 🟢 עדיפות נמוכה (Low Priority)

### Premium Features

- [ ] **PREMIUM-001:** Implement premium functionality
  - [ ] Define premium features
  - [ ] Add premium feature gates
  - [ ] Implement premium upgrade flow
  - [ ] Update PaywallModal to work
  - [ ] Or remove premium flag if not needed

### Notifications

- [ ] **NOTIF-001:** Implement notification system
  - [ ] Add push notification support
  - [ ] Implement daily reminder notifications
  - [ ] Implement new affirmation notifications
  - [ ] Add notification preferences UI
  - [ ] Or remove notification settings if not needed

### Testing

- [ ] **TEST-001:** Add unit tests
  - [ ] Test hooks (useAffirmations, useProfile, etc.)
  - [ ] Test utility functions
  - [ ] Test audio player logic
  - [ ] Achieve >80% code coverage

- [ ] **TEST-002:** Add integration tests
  - [ ] Test API endpoints
  - [ ] Test database operations
  - [ ] Test R2 storage operations
  - [ ] Test external API integrations

- [ ] **TEST-003:** Add E2E tests
  - [ ] Test onboarding flow
  - [ ] Test affirmation generation
  - [ ] Test audio playback
  - [ ] Test favorites management

### Security Enhancements

- [ ] **SEC-001:** Add security measures
  - [ ] Add CSRF protection
  - [ ] Add rate limiting
  - [ ] Sanitize user inputs
  - [ ] Add request validation
  - [ ] Secure API keys (environment variables)

- [ ] **SEC-002:** Add data validation
  - [ ] Validate email formats
  - [ ] Validate age ranges (13-120)
  - [ ] Validate text lengths
  - [ ] Add input sanitization

---

## 📋 משימות טכניות ספציפיות

### Code Quality

- [ ] **CODE-001:** Add missing type annotations
  - [ ] Type all API responses
  - [ ] Type all database query results
  - [ ] Type all event handlers
  - [ ] Remove any `any` types

- [ ] **CODE-002:** Improve code organization
  - [ ] Split large files (Settings.tsx is 1553 lines)
  - [ ] Extract reusable logic
  - [ ] Add more utility functions
  - [ ] Improve code comments

### Documentation

- [ ] **DOC-001:** Add API documentation
  - [ ] Document all endpoints
  - [ ] Add request/response examples
  - [ ] Add error code documentation

- [ ] **DOC-002:** Add code documentation
  - [ ] Add JSDoc comments to functions
  - [ ] Document complex logic
  - [ ] Add README for setup instructions

### Performance

- [ ] **PERF-001:** Optimize audio loading
  - [ ] Add audio preloading
  - [ ] Add audio caching
  - [ ] Optimize audio file sizes
  - [ ] Add lazy loading for audio

- [ ] **PERF-002:** Optimize database queries
  - [ ] Add query indexes if needed
  - [ ] Optimize N+1 queries
  - [ ] Add query result caching
  - [ ] Optimize large data fetches

### Migration & Deployment

- [ ] **MIGRATE-001:** Ensure migrations are applied
  - [ ] Verify migration 3 is applied in production
  - [ ] Test migration rollback
  - [ ] Document migration process

- [ ] **DEPLOY-001:** Add deployment checks
  - [ ] Add pre-deployment validation
  - [ ] Add database migration checks
  - [ ] Add environment variable validation
  - [ ] Add deployment rollback plan

---

## 🔍 משימות בדיקה ואימות

### Regression Testing

- [ ] **QA-001:** Test onboarding flow
  - [ ] Test Splash → Tutorial → Signup → Questions → Voice Setup
  - [ ] Verify all data is saved correctly
  - [ ] Test navigation between steps

- [ ] **QA-002:** Test affirmation flow
  - [ ] Test generation with different preferences
  - [ ] Test audio generation
  - [ ] Test background music selection
  - [ ] Test favorites toggle

- [ ] **QA-003:** Test audio playback
  - [ ] Test with different voices
  - [ ] Test background music playback
  - [ ] Test volume controls
  - [ ] Test autoplay functionality

- [ ] **QA-004:** Test data management
  - [ ] Test profile editing
  - [ ] Test preferences updates
  - [ ] Test voice recording
  - [ ] Test music upload
  - [ ] Test deletion flows

### Integration Testing

- [ ] **QA-005:** Test API endpoints
  - [ ] Test all 27 endpoints
  - [ ] Test error cases
  - [ ] Test edge cases
  - [ ] Test with missing data

- [ ] **QA-006:** Test external APIs
  - [ ] Test OpenAI API integration
  - [ ] Test Google TTS API integration
  - [ ] Test error handling for API failures
  - [ ] Test rate limiting

### Performance Testing

- [ ] **QA-007:** Test with large datasets
  - [ ] Test with 100+ affirmations
  - [ ] Test with large audio files
  - [ ] Test search/filter performance
  - [ ] Test R2 list operations

---

## 📊 סיכום לפי קטגוריה

### Authentication & Security (3 משימות)
- AUTH-001, AUTH-002, AUTH-003

### Type Safety (2 משימות)
- TYPE-001, TYPE-002

### Validation (2 משימות)
- VALID-001, VALID-002

### Custom Voices (1 משימה)
- VOICE-001

### Database (2 משימות)
- DB-001, DB-002

### Error Handling (2 משימות)
- ERR-001, ERR-002

### File Management (2 משימות)
- FILE-001, FILE-002

### Analytics (2 משימות)
- ANALYTICS-001, ANALYTICS-002

### Premium Features (1 משימה)
- PREMIUM-001

### Notifications (1 משימה)
- NOTIF-001

### Testing (3 משימות)
- TEST-001, TEST-002, TEST-003

### Security (2 משימות)
- SEC-001, SEC-002

### Code Quality (2 משימות)
- CODE-001, CODE-002

### Documentation (2 משימות)
- DOC-001, DOC-002

### Performance (2 משימות)
- PERF-001, PERF-002

### Migration & Deployment (2 משימות)
- MIGRATE-001, DEPLOY-001

### QA & Testing (7 משימות)
- QA-001 עד QA-007

---

## 🎯 יעדים קצרי טווח (Sprint 1)

**מוקד:** Authentication & Type Safety

1. AUTH-001: Implement real authentication
2. AUTH-002: Implement signup endpoint
3. TYPE-001: Add missing TypeScript types
4. VALID-001: Add Zod validation to key endpoints

**אומדן:** 2-3 שבועות

---

## 🎯 יעדים בינוני טווח (Sprint 2-3)

**מוקד:** Error Handling & File Management

1. ERR-001: Add retry logic
2. FILE-001: Add file cleanup
3. FILE-002: Add file upload limits
4. DB-001: Add foreign key constraints

**אומדן:** 3-4 שבועות

---

## 🎯 יעדים ארוכי טווח (Sprint 4+)

**מוקד:** Testing & Premium Features

1. TEST-001, TEST-002, TEST-003: Add comprehensive testing
2. PREMIUM-001: Implement premium features
3. ANALYTICS-001: Add mood tracking visualization
4. NOTIF-001: Implement notifications

**אומדן:** 4-6 שבועות

---

## 📝 הערות

- כל משימה צריכה להיות מפורטת יותר עם acceptance criteria
- יש להקצות משימות לפי עדיפות וזמינות משאבים
- יש לעדכן את הדוח הטכני אחרי השלמת כל משימה
- יש לבדוק backward compatibility לפני כל שינוי

---

**עודכן לאחרונה:** 2025-01-26

