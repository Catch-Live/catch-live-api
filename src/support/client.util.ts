export function getNextYouTubeApiKey(): string {
  const YOUTUBE_API_KEYS = (process.env.YOUTUBE_API_KEYS ?? '').split(',').map((k) => k.trim());
  let apiKeyIndex = 0;
  const key = YOUTUBE_API_KEYS[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % YOUTUBE_API_KEYS.length;

  return key;
}
