const {
  send,
  allowMethod,
  getData,
  getQuery
} = require("./_lib");

module.exports = async function handler(req, res) {
  if (!allowMethod(req, res)) return;

  try {
    const data = await getData();

    const q = getQuery(req, "q").toLowerCase();
    const category = getQuery(req, "category");

    let articles = data.articles;

    if (q) {
      articles = articles.filter((article) =>
        article.title.toLowerCase().includes(q) ||
        article.source.toLowerCase().includes(q)
      );
    }

    if (category && category !== "전체") {
      articles = articles.filter(
        (article) => article.category === category
      );
    }

    return send(res, 200, {
      ok: true,
      updatedAt: data.updatedAt,
      total: articles.length,
      articles: articles.slice(0, 100)
    });
  } catch (error) {
    console.error("TrendScope articles error:", error);

    return send(res, 500, {
      error: "뉴스 목록을 불러오지 못했습니다.",
      detail: process.env.NODE_ENV === "development"
        ? String(error.message || error)
        : undefined
    });
  }
};
