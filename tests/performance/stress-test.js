import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 20 },
    { duration: '5m', target: 40 },
    { duration: '5m', target: 60 },
    { duration: '5m', target: 80 },
    { duration: '5m', target: 100 },   // Stress level
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<5000'],
    http_req_failed: ['rate<0.3'],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/api/v2/employees`);
  
  check(response, {
    'stress test - status ok': (r) => r.status < 500,
  });

  sleep(1);
}
