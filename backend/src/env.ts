export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || ''
}
