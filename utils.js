const createConfig = (url, accessToken, method) => {
  return {
    method: method || "GET",
    url: url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-type": "application/json",
    },
  };
};

module.exports = { createConfig };
