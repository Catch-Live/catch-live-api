export const API_URL = {
  CHZZK: {
    BASE: 'https://api.chzzk.naver.com',
    LIVE: 'https://chzzk.naver.com',
  },
  YOUTUBE: {
    BASE: 'https://www.googleapis.com',
    LIVE: 'https://youtube.com',
  },
};

export const REDIS_KEY = {
  JOB_DONE_QUEUE: 'job:done',
  JOB_META: 'job:metas',
  JOB_WAITING_QUEUE: 'job:waiting:queue',
  JOB_FAIL_QUEUE: 'job:fail:queue',
  HEARTBEAT: 'heartbeat:worker',
  RECORDING_SET_PREFIX: 'recording:worker',
  MONITORING_IS_CHANGED: 'monitoring:isChanged',
  MONITORING_STREAMERS: 'monitoring:streamers',
};
