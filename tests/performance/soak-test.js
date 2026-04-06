import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp-up to 50 users
    { duration: '5m', target: 50 },    // Soak at 50 users
    { duration: '2m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/api/v2/employees`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(3);
}
