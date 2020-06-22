export function getPort() {
  return process.env.PORT ? Number(process.env.PORT) : 3000;
}
