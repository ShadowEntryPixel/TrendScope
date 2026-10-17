
import { Redis } from "@upstash/redis";
import Parser from "rss-parser";

const redis = Redis.fromEnv();
const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent": "TrendScope/1.0 (trend research)"
  }
});

const STORAGE_KEY = "trendscope:v2:data";

export const PRODUCTS = [
  // 말랑이 · 촉감 장난감 (1~20)
  ["말랑이", "촉감 장난감", ["말랑이", "스퀴시"]],
  ["크런치 말랑이", "촉감 장난감", ["크런치 말랑이", "크런치 스퀴시"]],
  ["샤베트 말랑이", "촉감 장난감", ["샤베트 말랑이", "슬러시 말랑이"]],
  ["왁뿌볼", "촉감 장난감", ["왁뿌볼", "왁스 볼 장난감"]],
  ["버블 말랑이", "촉감 장난감", ["버블 말랑이", "버블 스퀴시"]],
  ["젤리 스퀴시", "촉감 장난감", ["젤리 스퀴시", "젤리 말랑이"]],
  ["모찌 스퀴시", "촉감 장난감", ["모찌 스퀴시", "모찌 말랑이"]],
  ["빵 스퀴시", "촉감 장난감", ["빵 스퀴시", "빵 말랑이"]],
  ["과일 스퀴시", "촉감 장난감", ["과일 스퀴시", "과일 말랑이"]],
  ["물풍선 장난감", "촉감 장난감", ["물풍선 장난감", "워터볼"]],
  ["슬라임", "촉감 장난감", ["슬라임", "슬라임 장난감"]],
  ["버터 슬라임", "촉감 장난감", ["버터 슬라임"]],
  ["클라우드 슬라임", "촉감 장난감", ["클라우드 슬라임"]],
  ["클리어 슬라임", "촉감 장난감", ["클리어 슬라임"]],
  ["크런치 슬라임", "촉감 장난감", ["크런치 슬라임"]],
  ["키보드 ASMR 장난감", "촉감 장난감", ["키보드 ASMR", "키캡 장난감"]],
  ["피젯 큐브", "피젯 토이", ["피젯 큐브", "피젯토이"]],
  ["팝잇", "피젯 토이", ["팝잇", "팝잇 장난감"]],
  ["무한 큐브", "피젯 토이", ["무한 큐브", "인피니티 큐브"]],
  ["자석 피젯", "피젯 토이", ["자석 피젯", "마그넷 피젯"]],

  // 캐릭터 · 블라인드 박스 (21~40)
  ["SKULLPANDA", "캐릭터 굿즈", ["SKULLPANDA", "스컬판다"]],
  ["CRYBABY", "캐릭터 굿즈", ["CRYBABY", "크라이베이비"]],
  ["LABUBU", "캐릭터 굿즈", ["LABUBU", "라부부"]],
  ["DIMOO", "캐릭터 굿즈", ["DIMOO", "디무"]],
  ["MOLLY", "캐릭터 굿즈", ["MOLLY 피규어", "몰리 피규어"]],
  ["HACIPUPU", "캐릭터 굿즈", ["HACIPUPU", "하치푸푸"]],
  ["Zsiga", "캐릭터 굿즈", ["Zsiga", "즈시가"]],
  ["Hirono", "캐릭터 굿즈", ["Hirono", "히로노 피규어"]],
  ["Pucky", "캐릭터 굿즈", ["Pucky", "푸키 피규어"]],
  ["Sweet Bean", "캐릭터 굿즈", ["Sweet Bean 피규어", "스위트빈"]],
  ["블라인드 박스", "캐릭터 굿즈", ["블라인드 박스", "랜덤 피규어"]],
  ["랜덤 피규어", "캐릭터 굿즈", ["랜덤 피규어", "랜덤박스 피규어"]],
  ["랜덤 키링", "캐릭터 굿즈", ["랜덤 키링", "랜덤 키홀더"]],
  ["인형 키링", "캐릭터 굿즈", ["인형 키링", "플러시 키링"]],
  ["봉제 인형", "캐릭터 굿즈", ["봉제 인형", "캐릭터 인형"]],
  ["아크릴 키링", "캐릭터 굿즈", ["아크릴 키링", "아크릴 키홀더"]],
  ["캐릭터 스티커", "캐릭터 굿즈", ["캐릭터 스티커", "다꾸 스티커"]],
  ["캐릭터 피규어", "캐릭터 굿즈", ["캐릭터 피규어", "미니 피규어"]],
  ["캐릭터 파우치", "캐릭터 굿즈", ["캐릭터 파우치", "인형 파우치"]],
  ["랜덤 굿즈", "캐릭터 굿즈", ["랜덤 굿즈", "랜덤 상품"]],

  // 문구 · 다꾸 (41~60)
  ["마스킹 테이프", "문구", ["마스킹 테이프", "마테"]],
  ["다꾸 스티커", "문구", ["다꾸 스티커", "다이어리 스티커"]],
  ["탑로더", "문구", ["탑로더", "포토카드 탑로더"]],
  ["포토카드", "문구", ["포토카드", "포카"]],
  ["포토카드 바인더", "문구", ["포토카드 바인더", "포카 바인더"]],
  ["젤펜", "문구", ["젤펜", "젤 잉크 펜"]],
  ["흔들펜", "문구", ["흔들펜", "글리터 펜"]],
  ["형광펜", "문구", ["형광펜", "파스텔 형광펜"]],
  ["샤프펜슬", "문구", ["샤프펜슬", "샤프"]],
  ["다색 볼펜", "문구", ["다색 볼펜", "멀티펜"]],
  ["미니 노트", "문구", ["미니 노트", "미니 수첩"]],
  ["다이어리", "문구", ["다이어리", "다꾸 다이어리"]],
  ["떡메모지", "문구", ["떡메모지", "메모 패드"]],
  ["랜덤 스티커", "문구", ["랜덤 스티커", "스티커 팩"]],
  ["데코 테이프", "문구", ["데코 테이프", "꾸미기 테이프"]],
  ["미니 가위", "문구", ["미니 가위", "휴대용 가위"]],
  ["마그넷 북마크", "문구", ["마그넷 북마크", "자석 책갈피"]],
  ["클립 세트", "문구", ["캐릭터 클립", "문구 클립"]],
  ["연필 캡", "문구", ["연필 캡", "연필 보호캡"]],
  ["필통", "문구", ["필통", "캐릭터 필통"]],

  // 디지털 · 데스크테리어 (61~80)
  ["키캡", "디지털·데스크", ["키캡", "키보드 키캡"]],
  ["기계식 키보드", "디지털·데스크", ["기계식 키보드", "커스텀 키보드"]],
  ["저소음 키보드", "디지털·데스크", ["저소음 키보드"]],
  ["키보드 손목 받침대", "디지털·데스크", ["키보드 손목 받침대", "팜레스트"]],
  ["마우스 패드", "디지털·데스크", ["마우스 패드", "데스크 매트"]],
  ["미니 무드등", "디지털·데스크", ["미니 무드등", "캐릭터 무드등"]],
  ["LED 조명", "디지털·데스크", ["LED 조명", "데스크 조명"]],
  ["아크릴 스탠드", "디지털·데스크", ["아크릴 스탠드", "아크릴 피규어"]],
  ["미니 선풍기", "디지털·데스크", ["미니 선풍기", "휴대용 선풍기"]],
  ["휴대용 보조배터리", "디지털·데스크", ["보조배터리", "휴대용 배터리"]],
  ["무선 이어폰", "디지털·데스크", ["무선 이어폰", "블루투스 이어폰"]],
  ["헤드폰", "디지털·데스크", ["헤드폰", "무선 헤드폰"]],
  ["태블릿 거치대", "디지털·데스크", ["태블릿 거치대", "태블릿 스탠드"]],
  ["휴대폰 스트랩", "디지털·데스크", ["휴대폰 스트랩", "폰 스트랩"]],
  ["휴대폰 케이스", "디지털·데스크", ["휴대폰 케이스", "캐릭터 폰케이스"]],
  ["케이블 보호캡", "디지털·데스크", ["케이블 보호캡", "케이블 바이트"]],
  ["USB 허브", "디지털·데스크", ["USB 허브", "멀티 허브"]],
  ["미니 블루투스 스피커", "디지털·데스크", ["미니 블루투스 스피커", "블루투스 스피커"]],
  ["웹캠", "디지털·데스크", ["웹캠", "USB 카메라"]],
  ["데스크 오거나이저", "디지털·데스크", ["데스크 오거나이저", "책상 정리함"]],

  // 라이프스타일 · 취미 (81~100)
  ["텀블러", "라이프스타일", ["텀블러", "캐릭터 텀블러"]],
  ["미니 물병", "라이프스타일", ["미니 물병", "휴대용 물병"]],
  ["에코백", "라이프스타일", ["에코백", "캐릭터 에코백"]],
  ["미니 파우치", "라이프스타일", ["미니 파우치", "동전 파우치"]],
  ["헤어 집게핀", "라이프스타일", ["집게핀", "헤어 클립"]],
  ["캐릭터 양말", "라이프스타일", ["캐릭터 양말", "캐릭터 삭스"]],
  ["키링 지갑", "라이프스타일", ["키링 지갑", "미니 지갑"]],
  ["미니 거울", "라이프스타일", ["미니 거울", "휴대용 거울"]],
  ["향기 스티커", "라이프스타일", ["향기 스티커"]],
  ["DIY 비즈 키트", "취미", ["비즈 키트", "DIY 비즈"]],
  ["비즈 팔찌", "취미", ["비즈 팔찌", "비즈 액세서리"]],
  ["레진 공예 키트", "취미", ["레진 공예 키트", "UV 레진 키트"]],
  ["미니 블록", "취미", ["미니 블록", "나노 블록"]],
  ["DIY 미니어처", "취미", ["DIY 미니어처", "미니어처 만들기"]],
  ["컬러링북", "취미", ["컬러링북", "컬러링 북"]],
  ["보드게임", "취미", ["보드게임", "파티 게임"]],
  ["직소 퍼즐", "취미", ["직소 퍼즐", "퍼즐"]],
  ["미니 플라워 키트", "취미", ["미니 플라워 키트", "꽃 만들기 키트"]],
  ["봉제 DIY 키트", "취미", ["봉제 DIY 키트", "인형 만들기 키트"]],
  ["랜덤 문구 세트", "취미", ["랜덤 문구 세트", "문구 랜덤박스"]]
].map(([name, category, keywords], index) => ({
  id: `product-${String(index + 1).padStart(3, "0")}`,
  name,
  category,
  keywords
}));

const FEEDS = [
  "말랑이",
  "스퀴시",
  "슬라임",
  "피젯 토이",
  "SKULLPANDA",
  "CRYBABY",
  "라부부",
  "블라인드 박스",
  "캐릭터 굿즈",
  "문구 신상",
  "다꾸 스티커",
  "키캡",
  "데스크테리어",
  "미니어처 DIY",
  "랜덤 키링",
  "신상 장난감"
];

function googleNewsUrl(query) {
  return (
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(`${query} when:30d`) +
    "&hl=ko&gl=KR&ceid=KR:ko"
  );
}

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function countMentions(text, keywords) {
  const normalized = text.toLocaleLowerCase("ko-KR");
  return keywords.reduce((count, keyword) => {
    const escaped = keyword.toLocaleLowerCase("ko-KR");
    return count + (normalized.includes(escaped) ? 1 : 0);
  }, 0);
}

function scoreProduct(product, articles) {
  let mentions = 0;
  let recentMentions = 0;
  const matchedArticles = [];

  for (const article of articles) {
    const text = `${article.title} ${article.description}`.toLocaleLowerCase("ko-KR");
    const hits = countMentions(text, product.keywords);

    if (hits > 0) {
      mentions += hits;
      matchedArticles.push(article);

      const age = Date.now() - new Date(article.publishedAt).getTime();
      if (Number.isFinite(age) && age >= 0 && age <= 7 * 86400000) {
        recentMentions += hits;
      }
    }
  }

  return {
    ...product,
    mentions,
    recentMentions,
    articleCount: matchedArticles.length,
    trendScore: Math.min(
      100,
      Math.round(recentMentions * 8 + mentions * 2)
    ),
    articles: matchedArticles.slice(0, 5).map(({ title, url, publishedAt }) => ({
      title,
      url,
      publishedAt
    }))
  };
}

export async function collectAndSave() {
  const collected = [];
  const errors = [];

  // RSS 요청 수를 제한해 서버리스 실행시간을 아낀다.
  const selectedFeeds = FEEDS.slice(0, 12);

  const results = await Promise.allSettled(
    selectedFeeds.map(async (query) => {
      const feed = await parser.parseURL(googleNewsUrl(query));

      return (feed.items || []).map((item) => ({
        title: cleanText(item.title || ""),
        description: cleanText(item.contentSnippet || item.content || ""),
        url: item.link || "",
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        source: cleanText(item.creator || item.source?.name || "Google News"),
        query
      })).filter((article) => article.title && article.url);
    })
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    if (result.status === "fulfilled") {
      collected.push(...result.value);
    } else {
      errors.push({
        query: selectedFeeds[i],
        message: String(result.reason?.message || "RSS 수집 실패")
      });
    }
  }

  // 모든 피드가 실패하면 기존 저장 데이터를 덮어쓰지 않는다.
  if (collected.length === 0) {
    throw new Error(
      `RSS 수집 실패: ${errors.map((e) => e.query).join(", ")}`
    );
  }

  const unique = new Map();

  for (const article of collected) {
    if (!unique.has(article.url)) unique.set(article.url, article);
  }

  const articles = [...unique.values()]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 500);

  const products = PRODUCTS
    .map((product) => scoreProduct(product, articles))
    .sort((a, b) => b.trendScore - a.trendScore);

  const snapshot = {
    version: 3,
    collectedAt: new Date().toISOString(),
    productCount: products.length,
    articleCount: articles.length,
    feedCount: selectedFeeds.length - errors.length,
    feedErrors: errors,
    products,
    articles
  };

  await redis.set(STORAGE_KEY, snapshot);
  return snapshot;
}

export async function getSnapshot() {
  return await redis.get(STORAGE_KEY);
}

export async function getProductById(id) {
  const snapshot = await getSnapshot();
  return snapshot?.products?.find((product) => product.id === id) || null;
}
