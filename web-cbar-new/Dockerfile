# syntax=docker/dockerfile:1
#
# Next.js server-rendered tətbiq. `output: "standalone"` (next.config.ts) özü-kifayət
# server çıxarır, ona görə runtime mərhələsində `node_modules` quraşdırılmır.
# Üç mərhələ `web-cbar` formatındadır ki, paylaşılan CI/CD şablonu onu dəyişmədən qura bilsin.
#
# UI kit (@cbar/lib-react-ui-kit) yalnız daxili registry-dədir və credential tələb edir.
# Credential build-ə YALNIZ secret mount ilə gəlir — RUN addımı bitəndə yox olur,
# heç bir layer-ə, keşə və `docker history`-yə düşmür (SC-008):
#
#   npm run docker:build                                  # lokal: .env.nexus-u özü verir
#   docker build --secret id=nexus_env,src=.env.nexus .   # eyni şey, əl ilə
#
# Secret-siz `docker build .` qırmızı bitir — install:nexus «docker» kontekstinin
# mesajı ilə (kit-siz image heç vaxt çıxmır).

FROM node:22-alpine AS deps
WORKDIR /app

# CI=true: interactive prompt-lar və progress bar söndürülür; `prepare` hook-u da
# bu bayrağa görə səssiz ötür.
ENV CI=true

# Kaniko fallback: kaniko `--mount` bayrağını nəzərə almır; o halda credential
# `--build-arg` ilə gəlir. ARG-lar yalnız bu mərhələdədir, runtime image-inə keçmir.
ARG NEXUS_USERNAME=
ARG NEXUS_PASSWORD=

# Asılılıqlar ayrıca qatda — mənbə dəyişəndə install yenidən işləmir.
COPY package.json package-lock.json .npmrc ./
COPY scripts/install/ ./scripts/install/
COPY scripts/git-hooks/ ./scripts/git-hooks/

RUN --mount=type=secret,id=nexus_env,target=/app/.env.nexus \
    NEXUS_USERNAME="$NEXUS_USERNAME" NEXUS_PASSWORD="$NEXUS_PASSWORD" \
    npm run install:nexus -- --context=docker

FROM node:22-alpine AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Asia/Baku

# `standalone` çıxışı özü ilə yalnız həqiqətən istifadə olunan asılılıqları gətirir.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# COPY leaves .next owned by root, and the node user could not create the image optimizer cache:
# every /_next/image request was encoded again (spec 036).
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3000

CMD ["node", "server.js"]
