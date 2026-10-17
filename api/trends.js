const {
  send,
  allowMethod,
  getData,
  getStatus,
  calculateTrends,
  getQuery
} = require("./_lib");

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res)) return;

  try {
    const [data, status] = await Promise.all([
      getData(),
      getStatus()
    ]);

    const q = getQuery(req, "q").toLowerCase();
    const category = getQuery(req, "category");

    let trends = calculateTrends(data.articles);

    if (q) {
      trends = trends.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    if (category && category !== "전체") {
      trends = trends.filter((item) => item.category === category);
    }

    return send(res, 200, {
      ok: true,
      updatedAt: data.updatedAt,
      articleCount: data.articles.length,
      feeds: data.feeds,
      status,
      trends
    });
  } catch (error) {
    console.error("TrendScope trends error:", error);

    return send(res, 500, {
      error: "유행 데이터를 불러오지 못했습니다.",
      detail: process.env.NODE_ENV === "development"
        ? String(error.message || error)
        : undefined
    });
  }
};
