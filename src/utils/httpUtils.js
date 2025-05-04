//Xây dựng httpClient để xử lý tập trung quá trình call API

export const client = {
  serverApi: import.meta.env.VITE_SERVER_API,
  token: null,
  send: async function (url, method = "GET", body = null, headers = {}) {
    if (!this.serverApi) {
      throw new Error("Vui lòng set serverApi");
    }
    url = `${this.serverApi}${url}`;
    const options = {};
    options.headers = headers;
    options.method = method;
    if (body) {
      options.body = JSON.stringify(body);
      options.headers["Content-Type"] = "application/json";
    }
    if (this.token) {
      options.headers["Authorization"] = `Bearer ${this.token}`;
    }
    const res = await fetch(url, options);
    const data = await res.json();
    return { res, data };
  },
  get: function (url, headers = {}) {
    return this.send(url, "GET", null, headers);
  },
  post: function (url, body, headers = {}) {
    return this.send(url, "POST", body, headers);
  },
  put: function (url, body, headers = {}) {
    return this.send(url, "PUT", body, headers);
  },
  patch: function (url, body, headers = {}) {
    return this.send(url, "PATCH", body, headers);
  },
  delete: function (url, headers = {}) {
    return this.send(url, "DELETE", null, headers);
  },
};
