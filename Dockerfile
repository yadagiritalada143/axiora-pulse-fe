# Multi-stage build: compile the Vite SPA, then serve the static files with nginx.
#
# NOTE ON VITE ENV: VITE_* values are baked into the bundle at BUILD time, not read
# at runtime. To keep the "build once, promote the same image QA -> prod" guarantee,
# only environment-NEUTRAL values are baked here:
#   - VITE_API_URL=/api is relative, so it is identical in every environment.
#   - App name / logger use production-safe defaults.
#   - VITE_GOOGLE_CLIENT_ID is a PUBLIC OAuth client id (it ships in the browser
#     bundle anyway) and is the same value in every environment, so baking it
#     keeps the single-image promise. Each environment's origin must be added to
#     the OAuth client's Authorized JavaScript origins in Google Cloud Console.
# If per-environment frontend config is needed later, switch to runtime config
# injection (a small entrypoint that writes window.__ENV__) rather than per-env builds.

# ---- Stage 1: build ----------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_APP_NAME="Axiora Pulse"
ARG VITE_ENABLE_LOGGER=false
ARG VITE_GOOGLE_CLIENT_ID=422878278312-qth6djfnrk8oqb3r17162avgkel7s74u.apps.googleusercontent.com
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_ENABLE_LOGGER=$VITE_ENABLE_LOGGER \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ---- Stage 2: serve ----------------------------------------------------------
FROM nginx:alpine

# Replace the default site with our SPA config (gzip + SPA fallback + cache headers).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets built in stage 1.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
