import { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const formatSimilarity = (distance) => {
  const safe = typeof distance === "number" ? distance : 1;
  const similarity = Math.max(0, Math.min(1, 1 - safe));
  return Math.round(similarity * 100);
};

const getItemName = (itemName, filepath, fallback) => {
  if (itemName) return itemName;
  const source = filepath
    ? filepath.split("/").pop()
    : fallback || "unknown";
  return source.replace(/\.[^/.]+$/, "");
};

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
};

export default function App() {
  const [query, setQuery] = useState("");
  const [k, setK] = useState(10);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmed = query.trim();

    setError("");
    if (!trimmed) {
      setHasSearched(false);
      setResults([]);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.post(
        `${API_BASE}/search`,
        { query: trimmed, k: Number(k) },
        { timeout: 15000 }
      );
      setResults(response.data?.results ?? []);
    } catch (err) {
      setError("서버에 연결할 수 없어요. FastAPI가 실행 중인지 확인해주세요.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-ink">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#CDEFE4] blur-3xl opacity-80" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#FFE2B8] blur-3xl opacity-70 animate-float" />
      <div className="pointer-events-none absolute bottom-[-140px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#FAD1C1] blur-3xl opacity-60" />

      <header className="relative z-10 px-6 pt-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf text-white shadow-glow">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-leaf/70">
                MapleStory
              </p>
              <h1 className="font-display text-2xl font-semibold md:text-3xl">
                MapleStory AI Search
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-md backdrop-blur md:flex">
            <ImageIcon className="h-4 w-4" />
            SigLIP + LoRA · ChromaDB
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-6 pb-12 pt-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-base text-slate-600 md:text-lg">
              한국어 텍스트로 메이플스토리 아이템 이미지를 찾아보세요.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-3xl">
              <div className="glass-panel flex flex-col gap-3 p-3 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-inner">
                  <Search className="h-5 w-5 text-slate-500" />
                  <input
                    className="w-full bg-transparent text-base outline-none placeholder:text-slate-400 md:text-lg"
                    placeholder="예: 파란색 모자, 분홍 날개, 레인보우 스타"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-2 md:justify-end">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>k</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={k}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (Number.isNaN(next)) return;
                        setK(Math.min(50, Math.max(1, next)));
                      }}
                      className="w-16 rounded-xl border border-slate-200 bg-white/80 px-2 py-1 text-center text-sm outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-leaf px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px] hover:bg-[#145447]"
                  >
                    검색
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div
                className="mx-auto mt-4 flex max-w-2xl items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">
                Search Results
              </h2>
              {hasSearched && !isLoading && (
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm">
                  {results.length} results
                </span>
              )}
            </div>

            {!hasSearched && !isLoading && (
              <div className="glass-panel flex min-h-[240px] items-center justify-center text-center text-slate-600">
                검색어를 입력하세요
              </div>
            )}

            {isLoading && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  검색 중...
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: Math.min(k, 10) }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="h-48 rounded-2xl bg-white/70 shadow-sm animate-pulse"
                    />
                  ))}
                </div>
              </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && (
              <div className="glass-panel flex min-h-[200px] items-center justify-center text-center text-slate-600">
                검색 결과가 없어요. 다른 키워드를 시도해보세요.
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {results.map((item, index) => {
                  const similarity = formatSimilarity(item.distance);
                  const itemName = getItemName(
                    item.item_name,
                    item.filepath,
                    item.id
                  );
                  const labelText = item.label || "아이템 설명 없음";
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="glass-panel flex flex-col overflow-hidden rounded-2xl shadow-md transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg animate-fade-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className="relative flex h-40 items-center justify-center bg-slate-50 p-4">
                        <img
                          src={getImageSrc(item.image_url)}
                          alt={itemName}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[11px] text-slate-600 shadow-sm">
                          유사도 {similarity}%
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                        <p className="truncate font-bold text-slate-800">
                          {itemName}
                        </p>
                        <p className="text-xs text-slate-500">{labelText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-6 pb-10 text-center text-xs text-slate-500">
        Text → Vector → ANN Search · Designed for large-scale image retrieval
      </footer>
    </div>
  );
}
