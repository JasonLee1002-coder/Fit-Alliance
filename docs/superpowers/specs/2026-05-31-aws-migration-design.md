# Fit-Alliance AWS EC2 Migration Design
Date: 2026-05-31

## Goal
Migrate Fit-Alliance from Vercel to AWS EC2 Tokyo, accessible at `poc.mcstation.ai/fit-alliance`.

## Architecture
- EC2: i-0edcfd5786837c7b0 (ap-northeast-1), path: /home/jason/fit-alliance
- Port: 3006 (127.0.0.1 only)
- Nginx: omnicore-nginx proxy_pass localhost:3006
- DB: Supabase (unchanged)

## Deployment Method
Next.js Standalone + Docker Compose

## Files to Add
1. `Dockerfile` — multi-stage (builder → runner), standalone output
2. `docker-compose.yml` — service fit-alliance, port 3006, env_file .env.production
3. `.dockerignore`

## next.config.ts Change
Add `output: 'standalone'`

## Nginx Change
Add location block for `/fit-alliance` in omnicore-nginx config

## Env Vars
`.env.production` on EC2 (not in git) — copy from .env.local + set NEXTAUTH_URL=https://poc.mcstation.ai/fit-alliance

## Update Flow
`git pull && docker-compose up -d --build`
