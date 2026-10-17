const {
  fetchNewsData,
  sendJson,
  errorMessage
} = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, {
      ok: false,
      error: "GET 요청만 지원합니다."
    });
  }

  try {
    const data = await fetchNewsData();

    if (!data.ok) {
      return sendJson(res, 502, {
        ...data,
        error: data.message || "뉴스 수집에 실패했습니다."
      });
    }

    return sendJson(res, 200, data);
  } catch (error) {
    console.error("TrendScope trends error:", error);

    return sendJson(res, 502, {
      ok: false,
      error: errorMessage(error),
      trends: [],
      articles: []
    });
  }
};
