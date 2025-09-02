import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Book,
  Server,
  Wrench,
  Home,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Link as LinkIcon,
} from "lucide-react";

/**
 * The Chilling SMP — Single-file Wiki Site
 * - Hash-based routing (no extra libs)
 * - Animated page transitions with Framer Motion
 * - Sidebar nav + search
 * - Collapsible sections, in-page anchors, copy-to-clipboard for commands
 * - Easy content: edit the WIKI constant below
 */

// ---- Editable Wiki Content ---- //
const WIKI = {
  siteTitle: "The Chilling SMP",
  tagline: "Your home for server history, plugins & datapacks, and how-tos.",
  pages: [
    {
      slug: "history",
      title: "Server History",
      icon: "Book",
      summary:
        "How The Chilling SMP began, major seasons, notable events, and community milestones.",
      sections: [
        {
          id: "origins",
          title: "Origins",
          body:
            "The Chilling SMP launched in [YEAR] as a close-friends survival world. Over time it grew into a modded+vanilla-plus server focused on chill progression, community builds, and seasonal events.",
        },
        {
          id: "seasons",
          title: "Seasons & Resets",
          body:
            "The server uses seasonal cycles to keep the world fresh and performance healthy. Typical cadence: ~6–12 months. Each season introduces new datapacks/plugins and a themed spawn hub.",
          bullets: [
            "Season 1 — The First Chill: Spawn Lake, starter town, Nether rail.",
            "Season 2 — Ice & Industry: Villager mall, iron farms, Elytra race.",
            "Season 3 — Chilled Realms: Claims/economy, mini-games, lore books.",
          ],
        },
        {
          id: "events",
          title: "Notable Events",
          body:
            "Community-run building contests, trade fairs, and boss rush weekends are common. Staff-hosted events award cosmetic titles and shop discounts rather than raw power.",
        },
      ],
      tags: ["about", "timeline", "seasons"],
    },
    {
      slug: "datapacks",
      title: "Datapacks",
      icon: "Server",
      summary:
        "Lightweight gameplay tweaks and features added via datapacks—no client mods needed.",
      sections: [
        {
          id: "overview",
          title: "Overview",
          body:
            "Datapacks extend vanilla with QoL and light content. All features run server-side; just join and play.",
        },
        {
          id: "pack-heads",
          title: "Player Heads (on death)",
          body:
            "Players drop a personalized head when killed (PvP or certain mobs). Great for museums and trophies.",
          tips: [
            "Toggle PvP in designated arenas to keep heads collectible but respectful.",
            'Display heads using item frames; use "Invisible Item Frame" (if enabled) for cleaner showcases.',
          ],
        },
        {
          id: "pack-veinminer",
          title: "Vein Miner (Ore Veining)",
          body:
            "Hold the sneak key while breaking an ore block to chain-mine connected veins. Tool durability scales accordingly.",
          commands: [
            "/trigger veinminer_toggle",
            "/trigger veinminer_mode set 1  # 1=ores, 2=logs (if enabled)",
          ],
        },
        {
          id: "pack-homes",
          title: "Basic Homes (Datapack Variant)",
          body:
            "Set and teleport to a few personal home points without relying on a plugin.",
          commands: [
            "/trigger sethome  # sets your current location as 'home'",
            "/trigger home     # teleports to 'home'",
          ],
        },
      ],
      tags: ["qol", "content", "vanilla+"],
    },
    {
      slug: "plugins",
      title: "Plugins",
      icon: "Wrench",
      summary:
        "Server-side plugins power claims, homes, warps, and economy. Feature list and how to use them.",
      sections: [
        {
          id: "claims",
          title: "Land Claims",
          body:
            "Protect builds from grief and manage trust per-claim. Use a golden shovel or commands (varies by plugin).",
          commands: [
            "/claim             # create a claim at your position",
            "/trust <player>    # let a player build in your claim",
            "/claimslist        # view your claims",
            "/unclaim           # remove current claim",
          ],
          tips: [
            "Keep some spare blocks in your inventory: claim size often scales with playtime or currency.",
            "Use subdivisions to separate storage rooms from farms.",
          ],
        },
        {
          id: "homes",
          title: "Homes & Warps",
          body:
            "Quick travel without breaking the world’s scale. Staff maintains public warps for hubs and districts.",
          commands: [
            "/sethome <name>",
            "/home <name>",
            "/delhome <name>",
            "/warp <public-warp>",
          ],
        },
        {
          id: "economy",
          title: "Shops & Economy",
          body:
            "A light-touch economy supports player shops and event rewards without pay-to-win.",
          commands: ["/balance", "/pay <player> <amount>", "/baltop"],
          tips: [
            "Most shops are at the Market District near spawn.",
            "Event prizes are cosmetic or convenience—no competitive advantage.",
          ],
        },
      ],
      tags: ["claims", "economy", "travel"],
    },
    {
      slug: "guides",
      title: "Guides",
      icon: "Book",
      summary:
        "Step-by-step help using server features. Great for new players to get settled.",
      sections: [
        {
          id: "starter-path",
          title: "New Player Starter Path",
          body:
            "Punch tree, craft tools, find food, and reach spawn hub. Claim a small plot, set a home, and join community builds.",
          bullets: [
            "/sethome base — always set this early.",
            "Claim a 21×21 around your starter house.",
            "Visit the Market District and grab job board tasks.",
          ],
        },
        {
          id: "claiming-101",
          title: "Claiming 101 (Step-by-step)",
          body:
            "Learn the basics of protecting your builds and inviting friends to collaborate.",
          commands: [
            "/claim",
            "/trust <friend>",
            "/containertrust <friend>  # if the plugin distinguishes chest access",
          ],
        },
      ],
      tags: ["how-to", "new players"],
    },
  ],
};

// Map icon names to lucide-react components
const ICONS = { Book, Server, Wrench, Home };

// Small helpers
const iconFor = (name) => {
  const Cmp = name ? ICONS[name] : ICONS.Book;
  return <Cmp className="w-5 h-5" />;
};

// Copy-to-clipboard with quick feedback
function Copyable({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {}
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 border border-gray-700 hover:border-gray-500 text-xs text-gray-300"
      title="Copy"
    >
      {ok ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy
    </button>
  );
}

// Code block for commands
function CodeBlock({ lines }) {
  return (
    <div className="bg-black/50 border border-gray-800 rounded-xl p-3 space-y-2 overflow-x-auto">
      {lines.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <pre className="whitespace-pre-wrap text-sm text-gray-200 flex-1">{l}</pre>
          <Copyable text={l.replace(/\s+#.*$/, "")} />
        </div>
      ))}
    </div>
  );
}

// Collapsible section
function Section({ section }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-semibold">{section.title}</span>
        </div>
        <a href={`#${section.id}`} className="text-gray-400 hover:text-gray-200" title="Link to section">
          <LinkIcon className="w-4 h-4" />
        </a>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4 pt-2 space-y-3 bg-gray-900/40"
            id={section.id}
          >
            {section.body && <p className="text-gray-300 leading-relaxed">{section.body}</p>}
            {section.bullets && (
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {section.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {section.commands && <CodeBlock lines={section.commands} />}
            {section.tips && (
              <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-3">
                <div className="text-blue-300 font-medium mb-1">Tips</div>
                <ul className="list-disc list-inside text-blue-200/90 space-y-1">
                  {section.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Search utility — searches titles, summaries, and section bodies
function useSearch(query) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WIKI.pages;
    return WIKI.pages
      .map((p) => {
        const hay = [p.title, p.summary, ...(p.sections?.map((s) => `${s.title} ${s.body || ""}`) || [])]
          .join("\n")
          .toLowerCase();
        return hay.includes(q) ? p : null;
      })
      .filter(Boolean);
  }, [query]);
}

// Simple hash router
function useRoute() {
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" ? window.location.hash.slice(1) : ""
  );
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (slug) => {
    if (typeof window !== "undefined") window.location.hash = slug;
  };
  return { route: route || "home", go };
}

// Layout shell
function Shell({ children }) {
  return <div className="flex h-screen bg-gray-900 text-gray-100">{children}</div>;
}

// Sidebar with active link
function Sidebar({ active, onNav }) {
  return (
    <div className="w-72 bg-gray-800/80 backdrop-blur border-r border-gray-700 p-4 hidden md:flex md:flex-col">
      <div className="text-2xl font-bold mb-1">{WIKI.siteTitle}</div>
      <div className="text-sm text-gray-400 mb-6">{WIKI.tagline}</div>
      <nav className="space-y-1">
        <SidebarLink slug="home" title="Home" icon="Home" active={active} onNav={onNav} />
        {WIKI.pages.map((p) => (
          <SidebarLink key={p.slug} slug={p.slug} title={p.title} icon={p.icon} active={active} onNav={onNav} />
        ))}
      </nav>
      <div className="mt-auto text-xs text-gray-500">© {new Date().getFullYear()} {WIKI.siteTitle}</div>
    </div>
  );
}

function SidebarLink({ slug, title, icon, active, onNav }) {
  const isActive = active === slug;
  return (
    <button
      onClick={() => onNav(slug)}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition border ${
        isActive
          ? "bg-blue-600/20 border-blue-600/40 text-blue-300"
          : "bg-transparent border-transparent hover:bg-gray-700/60 text-gray-300"
      }`}
    >
      {iconFor(icon)}
      <span className="text-left">{title}</span>
    </button>
  );
}

// Header with search
function Topbar({ query, setQuery }) {
  return (
    <div className="sticky top-0 z-10 bg-gray-900/70 backdrop-blur border-b border-gray-800 p-4">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-gray-400">
          <Home className="w-4 h-4" />
          <span className="text-sm">{WIKI.siteTitle}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-sm">Wiki</span>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages, features, and commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-800 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// Card grid for Home + search results
function PageGrid({ pages, onOpen }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((p) => (
        <motion.button
          key={p.slug}
          onClick={() => onOpen(p.slug)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gray-800 rounded-2xl p-5 text-left shadow-md border border-gray-700 hover:border-gray-600"
        >
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            {iconFor(p.icon)}
            <h2 className="text-lg font-semibold">{p.title}</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{p.summary}</p>
          {p.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </motion.button>
      ))}
    </div>
  );
}

// Full page view with ToC
function PageView({ page }) {
  const tocRef = useRef(null);
  useEffect(() => {
    // Scroll to hash within page
    const hash = window.location.hash.split("?")[0].split("#")[1];
    if (hash && document.getElementById(hash)) {
      document.getElementById(hash).scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [page?.slug]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-blue-400 mb-1">
          {iconFor(page.icon)}
          <h1 className="text-2xl font-bold">{page.title}</h1>
        </div>
        <p className="text-gray-300">{page.summary}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
        <div className="space-y-4">
          {page.sections?.map((s) => (
            <Section key={s.id} section={s} />
          ))}
        </div>

        <aside ref={tocRef} className="sticky top-20 hidden lg:block">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
            <div className="text-sm font-semibold mb-2 text-gray-200">On this page</div>
            <ul className="space-y-2 text-sm">
              {page.sections?.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-gray-400 hover:text-gray-200">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function WikiSite() {
  const { route, go } = useRoute();
  const [query, setQuery] = useState("");
  const searchResults = useSearch(query);

  const isHome = route === "home";
  const activePage = !isHome ? WIKI.pages.find((p) => p.slug === route) : null;

  return (
    <Shell>
      <Sidebar active={isHome ? "home" : route} onNav={go} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar query={query} setQuery={setQuery} />

        <AnimatePresence mode="wait">
          {isHome ? (
            <motion.main
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto p-6"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  {iconFor("Home")}
                  <h1 className="text-2xl font-bold">Welcome to {WIKI.siteTitle}</h1>
                </div>
                <p className="text-gray-300">{WIKI.tagline}</p>
              </div>

              {query ? (
                <>
                  <div className="text-sm text-gray-400 mb-3">{searchResults.length} result(s)</div>
                  <PageGrid pages={searchResults} onOpen={go} />
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-400 mb-3">Browse sections</div>
                  <PageGrid pages={WIKI.pages} onOpen={go} />
                </>
              )}
            </motion.main>
          ) : (
            <motion.main
              key={activePage?.slug || "404"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activePage ? (
                <PageView page={activePage} />
              ) : (
                <div className="max-w-3xl mx-auto p-6">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    {iconFor("Book")}
                    <h1 className="text-2xl font-bold">Page not found</h1>
                  </div>
                  <p className="text-gray-300 mb-4">The page "{route}" doesn’t exist yet.</p>
                  <button
                    onClick={() => go("home")}
                    className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-500"
                  >
                    Go Home
                  </button>
                </div>
              )}
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}
