import http from 'k6/http';

export class OrangeHRMClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  authenticate(username, password) {
    const payload = {
      username: username,
      password: password,
    };

    const response = http.post(`${this.baseURL}/api/v2/oauth/token`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      const body = response.json();
      if (body && body.access_token) {
        this.token = body.access_token;
        return true;
      }
    }
    return false;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  getEmployees() {
    return http.get(
      `${this.baseURL}/api/v2/employees`,
      { headers: this.getAuthHeaders() }
    );
  }

  createEmployee(data) {
    return http.post(
      `${this.baseURL}/api/v2/employees`,
      JSON.stringify(data),
      { headers: this.getAuthHeaders() }
    );
  }

  deleteEmployee(id) {
    return http.del(
      `${this.baseURL}/api/v2/employees/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
