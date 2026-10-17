async function fetchNewsData() {
  const results = await Promise.allSettled(
    SEARCH_TERMS.map((term) => fetchOneFeed(term))
  );

  const collected = [];
  let successfulFeeds = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      successfulFeeds++;
      collected.push(...result.value);
    }
  }

  // 기사 링크 기준 중복 제거
  const unique = new Map();

  for (const article of collected) {
    if (!unique.has(article.link)) {
      unique.set(article.link, article);
    }
  }

  // 최신 기사 우선 정렬
  const sortedArticles = [...unique.values()].sort((a, b) => {
    const timeA = a.publishedAt
      ? Date.parse(a.publishedAt)
      : 0;

    const timeB = b.publishedAt
      ? Date.parse(b.publishedAt)
      : 0;

    return timeB - timeA;
  });

  // 최대 100개
  const articles = sortedArticles.slice(0, 100);

  // 반환할 기사 100개를 기준으로 분석
  const trends = analyzeTrends(articles);

  return {
    ok: successfulFeeds > 0,
    updatedAt: new Date().toISOString(),
    articleCount: articles.length,
    keywordCount: trends.length,
    totalFeeds: SEARCH_TERMS.length,
    successfulFeeds,
    failedFeeds: SEARCH_TERMS.length - successfulFeeds,
    trends,
    articles,
    message:
      successfulFeeds === 0
        ? "뉴스 피드에 연결할 수 없어 데이터를 가져오지 못했습니다."
        : successfulFeeds < SEARCH_TERMS.length
          ? "일부 뉴스 피드만 수집했습니다."
          : null
  };
}
