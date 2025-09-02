import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Book, Server, Wrench } from "lucide-react";

export default function WikiSite() {
  const [query, setQuery] = useState("");
  const [activePage, setActivePage] = useState(null);

  const pages = [
    {
      title: "Server History",
      icon: <Book className="w-5 h-5" />, 
      content: "The Chilling SMP was founded in [YEAR]. It began as a survival server among friends and evolved into a modded community. Major events include [EVENT 1], [EVENT 2], and seasonal resets.",
    },
    {
      title: "Datapacks",
      icon: <Server className="w-5 h-5" />,
      content: "The server uses custom datapacks such as [Datapack Name] which adds [Feature]. To use them, simply play as normal—features are integrated into survival gameplay.",
    },
    {
      title: "Plugins",
      icon: <Wrench className="w-5 h-5" />,
      content: "Plugins include [Plugin Name], adding commands such as /spawn, /home, and server-side economy systems. Use /help in-game for a full list.",
    },
    {
      title: "Guides",
      icon: <Book className="w-5 h-5" />,
      content: "Guides will help you learn how to use plugins and datapacks. For example, [Guide Title] explains how to claim land, protect items, or use teleport features.",
    },
  ];

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const openPage = (page) => setActivePage(page);
  const closePage = () => setActivePage(null);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-800 p-4 border-r border-gray-700 hidden md:block"
      >
        <h1 className="text-2xl font-bold mb-6">The Chilling SMP</h1>
        <ul className="space-y-3">
          {pages.map((p, i) => (
            <li
              key={i}
              onClick={() => openPage(p)}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-400"
            >
              {p.icon}
              {p.title}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        {/* Search */}
        {!activePage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full mb-6"
          >
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search the wiki..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-800 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>
        )}

        {/* Page List */}
        {!activePage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {filtered.map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                onClick={() => openPage(p)}
                className="bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-700 cursor-pointer hover:border-blue-500"
              >
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  {p.icon}
                  <h2 className="text-xl font-semibold">{p.title}</h2>
                </div>
                <p className="text-gray-300 leading-relaxed line-clamp-3">
                  {p.content}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Single Page View */}
        <AnimatePresence>
          {activePage && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gray-900 p-6 overflow-y-auto"
            >
              <button
                onClick={closePage}
                className="mb-6 text-blue-400 hover:underline"
              >
                ← Back to Wiki
              </button>
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                {activePage.icon}
                <h2 className="text-2xl font-bold">{activePage.title}</h2>
              </div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {activePage.content}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
