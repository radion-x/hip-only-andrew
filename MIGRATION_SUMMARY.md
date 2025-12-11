# Migration Summary: nginx Proxy → Traefik Direct Routing

## Files Modified

### 1. **client/src/config/api.ts**
- Changed from relative paths to absolute URLs using `VITE_SERVER_BASE_URL`
- Added `fetchWithCredentials()` helper for cross-origin requests with cookies
- Frontend now makes direct API calls to backend domain

### 2. **client/nginx.conf**
- Removed `/api` proxy configuration
- Removed `/uploads` proxy configuration
- Now only serves static React app files
- Added static asset caching rules

### 3. **client/vite.config.ts**
- Updated proxy target from port 3889 → 3000
- Simplified proxy configuration (still used for local dev)

### 4. **client/.env.development**
- Updated `VITE_SERVER_BASE_URL` from port 3889 → 3000

### 5. **client/Dockerfile**
- No changes needed (already configured for build args)

### 6. **server/Dockerfile**
- Changed `EXPOSE` from 3889 → 3000

### 7. **server/app.js**
- Added trust proxy configuration (`app.set('trust proxy', true)`)
- Replaced simple `cors()` with advanced CORS configuration:
  - Origin validation against `ALLOWED_ORIGINS` environment variable
  - `credentials: true` for cross-origin cookie support
- Enhanced session configuration:
  - `sameSite: 'none'` in production for cross-domain cookies
  - `secure: true` in production for HTTPS-only cookies
  - `proxy: true` when `NODE_ENV=production`
  - Cookie domain configuration via `COOKIE_DOMAIN` env var
  - Logging for debugging

### 8. **server/.env**
- Changed `SERVER_PORT` from 3889 → 3000
- Changed `MONGODB_URI` database name from `andrew_knee` → `andrew_hip`
- Updated `SERVER_BASE_URL` to use port 3000
- Added `ALLOWED_ORIGINS` with local development URLs
- Added `COOKIE_DOMAIN` (empty for local dev)
- Added `TRUST_PROXY=false` for local development

### 9. **docker-compose.yaml**
- **Client service**:
  - Added `args` section with `VITE_SERVER_BASE_URL` build argument
  - Added Coolify labels (`coolify.managed=true`, `coolify.http=true`)
- **Server service**:
  - Changed exposed port from 3889 → 3000
  - Changed `SERVER_PORT` environment variable to 3000
  - Added `ALLOWED_ORIGINS` environment variable
  - Added `COOKIE_DOMAIN` environment variable
  - Added `TRUST_PROXY` environment variable
  - Added Coolify labels

## Files Created

### 1. **.env.production.example**
Complete production environment template with all required variables for Coolify deployment including:
- Frontend build args (`VITE_SERVER_BASE_URL`)
- Backend runtime config
- CORS settings (`ALLOWED_ORIGINS`)
- Cookie configuration (`COOKIE_DOMAIN`)
- Proxy settings (`TRUST_PROXY=true`)

### 2. **COOLIFY_DEPLOYMENT.md**
Comprehensive deployment guide covering:
- Architecture overview (dev vs production)
- Step-by-step Coolify configuration
- Environment variable setup for both services
- Domain configuration
- Testing procedures
- Troubleshooting common issues
- Security considerations

## Key Configuration for Production

### Domains
- **Frontend**: `https://hipiq.com.au`
- **Backend**: `https://api.hipiq.com.au`

### Critical Environment Variables

#### Frontend (Build Args)
```
VITE_SERVER_BASE_URL=https://api.hipiq.com.au
```

#### Backend (Runtime)
```
SERVER_PORT=3000
SERVER_BASE_URL=https://api.hipiq.com.au
ALLOWED_ORIGINS=https://hipiq.com.au,https://www.hipiq.com.au
COOKIE_DOMAIN=.hipiq.com.au
TRUST_PROXY=true
NODE_ENV=production
```

## What This Enables

### Before (nginx proxy)
```
User → hipiq.com.au
       └─ nginx container
          ├─ Serves React static files
          └─ Proxies /api/* → server:3889
```

### After (Traefik direct)
```
User → hipiq.com.au → Traefik → client:80 (nginx serves React)
       ↓
       Frontend JS makes API calls
       ↓
User → api.hipiq.com.au → Traefik → server:3000 (Express API)
```

## Benefits of New Architecture

1. **True Microservices**: Frontend and backend are independently deployable
2. **Scalability**: Services can be scaled independently
3. **Better Caching**: CDN can cache frontend without affecting API
4. **Flexibility**: Can deploy frontend and backend to different servers if needed
5. **Standard Practice**: Follows modern cloud-native deployment patterns

## Migration Checklist for Deployment

- [ ] Push changes to Git repository
- [ ] Create new project in Coolify
- [ ] Configure frontend service with `VITE_SERVER_BASE_URL`
- [ ] Configure backend service with all environment variables
- [ ] Set up domains in Coolify (hipiq.com.au + api.hipiq.com.au)
- [ ] Enable HTTPS/SSL for both domains
- [ ] Configure persistent storage for uploads
- [ ] Deploy both services
- [ ] Test CORS functionality
- [ ] Test dashboard login (cookie persistence)
- [ ] Test file uploads and access
- [ ] Monitor logs for any errors

## Rollback Plan

If issues occur, you can revert to nginx proxy mode by:
1. Reverting `client/src/config/api.ts` to use empty `API_BASE_URL`
2. Restoring nginx proxy configuration in `client/nginx.conf`
3. Reverting `server/app.js` CORS to simple `cors()`
4. Reverting docker-compose.yaml to single-domain setup
5. Deploying as a single service instead of two
