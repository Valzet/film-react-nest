FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api/afisha
ARG VITE_CDN_URL=/content/afisha
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CDN_URL=$VITE_CDN_URL

RUN npm run build

FROM alpine:3.19

WORKDIR /app
COPY --from=build /app/dist ./dist

CMD ["sh", "-c", "cp -r /app/dist/. /usr/share/nginx/html/ && tail -f /dev/null"]
