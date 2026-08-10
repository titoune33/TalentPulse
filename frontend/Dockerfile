# ===== Build stage: Next.js static export =====
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_BACKEND_URL is injected by Railway at build time
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

RUN npm run build

# ===== Serve stage: nginx =====
FROM nginx:alpine

COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.template.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
