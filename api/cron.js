const Parser = require("rss-parser");

const {
  redis,
  DATA_KEY,
  STATUS_KEY,
  KEYWORDS,
  send,
  cleanText,
  safeUrl
} = require("./_lib");

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent": "TrendScope/3.0 RSS Reader"
  }
});

const FEEDS = [
  {
    name: "촉감 완구",
    category: "촉감·완구",
    url: "https://news.google.com/rss/search?q=%EB%A7%90%EB%9E%91%EC%9D%B4+OR+%EC%8A%A4%ED%80%B4%EC%8B%9C&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "캐릭터 굿즈",
    category: "캐릭터·굿즈",
    url: "https://news.google.com/rss/search?q=%EC%BA%90%EB%A6%AD%ED%84%B0+%EA%B5%BF%EC%A6%88+OR+%EB%B8%94%EB%9D%BC%EC%9D%B8%EB%93%9C+%EB%B0%95%EC%8A%A4&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "문구",
    category: "문구·생활",
    url: "https://news.google.com/rss/search?q=%EC%8B%A0%EC%83%81+%EB%AC%B8%EA%B5%AC+OR+%EB%8B%A4%EA%BE%B8&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "키보드·데스크",
    category: "디지털·데스크",
    url: "https://news.google.com/rss/search?q=%ED%82%A4%EC%BA%A1+OR+%ED%82%A4%EB%B3%B4%EB%93%9C+%EC%8B%A0%EC%83%81&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "신제품",
    category: "신제품",
    url: "https://news.google.com/rss/search?q=%EC%8B%A0%EC%A0%9C%ED%92%88+%EC%9E%A5%EB%82%9C%EA%B0%90+OR+%ED%95%9C%EC%A0%95%ED%8C%90&hl=ko&gl=KR&ceid=KR:ko"
  }
];

function getSource(item, feedName) {
  if (item.source && item.source.name) {
    return cleanText(item.source.name, 100);
  }

  const title = cleanText(item.title, 250);
  const parts = title.split(" - ");

  return parts.length > 1
    ? cleanText(parts[parts.length - 1], 100)
    : feedName;
}

function normalizeArticle(item, feed) {
  const title = cleanText(item.title, 250);
  const link = safeUrl(item.link);

  if (!title || !link) return null;

  const publishedDate = item.isoDate || item.pubDate;
  const parsedDate = publishedDate ? new Date(publishedDate) : new Date();

  return {
    id: link,
    title,
    link,
    source: getSource(item, feed.name),
    category: feed.category,
    publishedAt: Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString()
  };
}

function checkCronSecret(req) {
  const secret = process.env.CRON_SECRET;

  if (!secret) return false;

  const authorization = req.headers.authorization || "";
  return authorization === `Bearer ${secret}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return send(res, 405, { error: "GET 요청만 허용됩니다." });
  }

  if (!checkCronSecret(req)) {
    return send(res, 401, { error: "인증에 실패했습니다." });
  }

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return send(res, 500, {
      error: "Redis 환경 변수가 설정되지 않았습니다."
    });
  }

  const startedAt = new Date().toISOString();

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);

      const articles = (parsed.items || [])
        .map((item) => normalizeArticle(item, feed))
        .filter(Boolean);

      return {
        feed: feed.name,
        category: feed.category,
        count: articles.length,
        articles
      };
    })
  );

  const feedStatuses = [];
  const allArticles = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      feedStatuses.push({
        name: result.value.feed,
        category: result.value.category,
        count: result.value.count,
        ok: true
      });

      allArticles.push(...result.value.articles);
    } else {
      feedStatuses.push({
        name: FEEDS[index].name,
        category: FEEDS[index].category,
        count: 0,
        ok: false,
        error: "피드를 가져오지 못했습니다."
      });
    }
  });

  if (allArticles.length === 0) {
    await redis.set(STATUS_KEY, {
      ok: false,
      attemptedAt: startedAt,
      feeds: feedStatuses,
      error: "수집된 기사가 없습니다."
    });

    return send(res, 502, {
      error: "RSS 피드에서 기사를 가져오지 못했습니다.",
      feeds: feedStatuses
    });
  }

  const unique = new Map();

  for (const article of allArticles) {
    if (!unique.has(article.id)) {
      unique.set(article.id, article);
    }
  }

  const articles = Array.from(unique.values())
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 500);

  const payload = {
    updatedAt: new Date().toISOString(),
    articles,
    feeds: feedStatuses
  };

  await redis.set(DATA_KEY, payload);

  const status = {
    ok: true,
    attemptedAt: startedAt,
    completedAt: payload.updatedAt,
    articleCount: articles.length,
    successfulFeeds: feedStatuses.filter((feed) => feed.ok).length,
    failedFeeds: feedStatuses.filter((feed) => !feed.ok).length,
    feeds: feedStatuses
  };

  await redis.set(STATUS_KEY, status);

  return send(res, 200, {
    ok: true,
    updatedAt: payload.updatedAt,
    articleCount: articles.length,
    feeds: feedStatuses
  });
};
