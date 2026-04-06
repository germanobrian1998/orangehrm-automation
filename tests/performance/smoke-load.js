import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
const ADMIN_USER = __ENV.ADMIN_USER || 'Admin';
const ADMIN_PASS = __ENV.ADMIN_PASS || 'admin123';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up to 10 users
    { duration: '1m', target: 10 },    // Stay at 10 users
    { duration: '30s', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95th percentile < 500ms
    http_req_failed: ['rate<0.1'],                     // Error rate < 10%
  },
};

export default function () {
  // Authenticate
  const loginPayload = JSON.stringify({
    username: ADMIN_USER,
    password: ADMIN_PASS,
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginResponse = http.post(`${BASE_URL}/web/index.php/auth/login`, loginPayload, loginParams);
  
  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Get employees list
  const employeesResponse = http.get(`${BASE_URL}/api/v2/employees`);
  
  check(employeesResponse, {
    'employees list status is 200': (r) => r.status === 200,
    'has employee data': (r) => r.body.includes('data'),
  });

  sleep(2);
}
