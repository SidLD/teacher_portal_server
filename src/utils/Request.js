import { Hono } from 'hono';

class Request {
  constructor(host, apiKey, appName, token) {
    this.host = host;
    this.appName = appName;
    this.apiKey = apiKey;
    this.token = token;
    this.headers = {};
  }

  setToken = (token) => {
    this.token = token;
  };

  addHeader = (key, value) => {
    this.headers[key] = value;
  };

  get = async (route) => this._request(route, 'GET');
  post = (route, body) => this._request(route, 'POST', body);
  patch = (route, body) => this._request(route, 'PATCH', body);
  delete = (route) => this._request(route, 'DELETE');

  _request = async (route, method, body) => {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...this.headers,
    };

    if (this.appName) headers['x-app'] = this.appName;
    if (this.apiKey) headers['Via-Access-Token'] = this.apiKey;
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      const response = await fetch(`${this.host}${route}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      return { response: data, statusCode: response.status };
    } catch (error) {
      return { statusCode: 500, error: error.message };
    }
  };
}

export default Request;
