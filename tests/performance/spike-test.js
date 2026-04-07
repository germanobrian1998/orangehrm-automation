import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '1m', target: 100 },   // Spike to 100 users
    { duration: '10s', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.2'],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/api/v2/employees`);
  
  check(response, {
    'spike test - status 200': (r) => r.status === 200,
  });

  sleep(1);
}
