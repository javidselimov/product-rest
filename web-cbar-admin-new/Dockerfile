# syntax=docker/dockerfile:1
# Build konteksti layihənin öz qovluğudur. Quruluş təşkilatın digər front-end-ləri
# ilə eynidir (node build stage + nginx stage), ona görə paylaşılan CI/CD şablonu
# onu dəyişmədən qura bilir.
#
# UI kit (@cbar/lib-react-ui-kit) yalnız daxili Nexus-dadır və credential tələb edir.
# Credential build-ə YALNIZ secret mount ilə gəlir (spec 004, D8) — RUN addımı bitəndə
# yox olur, heç bir layer-ə, keşə və `docker history`-yə düşmür:
#
#   npm run docker:build                                  # lokal: .env.nexus-u özü verir
#   docker build --secret id=nexus_env,src=.env.nexus .   # eyni şey, əl ilə
#
# Secret-siz `docker build .` qırmızı bitir — install:nexus "docker" kontekstinin
# mesajı ilə (kit-siz image heç vaxt çıxmır).
#
# Kaniko fallback (research D9): kaniko `--mount` bayrağını nəzərə almır; bu halda
# credential `--build-arg NEXUS_USERNAME=… --build-arg NEXUS_PASSWORD=…` ilə gəlir.
# ARG-lar yalnız bu build stage-dədir, yekun nginx image-inə keçmir; qalıq risk —
# builder-in keşi (README "Docker image" bölməsində qeyd olunub). BuildKit-də
# ARG-lar boş qalır və skript secret faylını oxuyur (env boş → fayl).
FROM node:22-alpine AS build
WORKDIR /app

# dev | test | production — npm skriptini (build:<env>) və Vite-in oxuduğu .env.<env>
# faylını seçir; VITE_API_URL build zamanı bundle-a yazılır (köhnə web-cbar-admin ilə
# eyni model). CI: .ci-cd/app.gitlab-ci.yml `--build-arg BUILD_ENV=…` ötürür.
ARG BUILD_ENV=production
ARG CACHEBUST=1

# CI=true: interactive prompt-lar və progress bar söndürülür.
# NPM_AUTH boş default: `.npmrc`-dəki `${NPM_AUTH}` substitusiyası unset dəyişəndə
# `npm run`-ın özünü yıxa bilir (spec 003 D5); real dəyəri install:nexus yalnız
# child `npm ci` prosesinə verir.
ENV CI=true
ENV NPM_AUTH=
ARG NEXUS_USERNAME=
ARG NEXUS_PASSWORD=

# Asılılıqlar ayrıca qatda — mənbə dəyişəndə install yenidən işləmir.
# .npmrc: @cbar scope-unun Nexus-a bağlanması; scripts/install: install:nexus və lib;
# scripts/git-hooks: `npm ci`-nin çağırdığı `prepare` skripti (CI=true ilə ötürür, spec 006 D9).
COPY package.json package-lock.json .npmrc ./
COPY scripts/install/ ./scripts/install/
COPY scripts/git-hooks/ ./scripts/git-hooks/
RUN --mount=type=secret,id=nexus_env,target=/app/.env.nexus \
    NEXUS_USERNAME="$NEXUS_USERNAME" NEXUS_PASSWORD="$NEXUS_PASSWORD" \
    npm run install:nexus -- --context=docker

COPY . .
RUN npm run build:${BUILD_ENV}

FROM nginx:alpine
# Pull Alpine security fixes released after the base image was built (e.g.
# CVE-2026-111497 in brotli-libs) so the container scan does not fail.
RUN apk upgrade --no-cache
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/
RUN chmod o+r -R /usr/share/nginx/html
EXPOSE 80
