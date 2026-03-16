const libraries = [
  {
    name: "React 19",
    url: "https://react.dev",
    description: "UI library for building component-based interfaces.",
  },
  {
    name: "TypeScript",
    url: "https://www.typescriptlang.org",
    description:
      "Typed superset of JavaScript for safer, more maintainable code.",
  },
  {
    name: "Vite",
    url: "https://vite.dev",
    description: "Fast build tool and development server.",
  },
  {
    name: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Utility-first CSS framework for styling.",
  },
  {
    name: "TanStack Query",
    url: "https://tanstack.com/query",
    description:
      "Async state management for data fetching, caching, and synchronisation.",
  },
  {
    name: "React Router",
    url: "https://reactrouter.com",
    description: "Client-side routing between pages.",
  },
  {
    name: "Zustand",
    url: "https://zustand.docs.pmnd.rs",
    description: "Lightweight global state management for filters and search.",
  },
  {
    name: "absurder-sql",
    url: "https://github.com/npiesco/absurder-sql",
    description:
      "SQLite compiled to WebAssembly with IndexedDB as a virtual file system, enabling persistent in-browser SQL storage without a server.",
  },
  {
    name: "react-markdown",
    url: "https://github.com/remarkjs/react-markdown",
    description:
      "Renders Markdown safely as React elements in task descriptions.",
  },
  {
    name: "Vitest",
    url: "https://vitest.dev",
    description: "Unit and integration test runner powered by Vite.",
  },
  {
    name: "Testing Library",
    url: "https://testing-library.com",
    description: "Utilities for testing components from a user's perspective.",
  },
];

const AboutPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">About</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Purpose</h2>
        <p className="text-gray-700">
          A task manager that runs entirely in the browser — no backend
          required. Tasks are stored in a SQLite database via WebAssembly and
          persisted to IndexedDB, so they survive page refreshes. Each task has
          a title, Markdown-enabled description, and a completion percentage.
          Tasks can be filtered by status, searched by title, and sorted
          alphabetically.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Libraries</h2>
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
          {libraries.map(({ name, url, description }) => (
            <li key={name} className="px-4 py-3">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {name}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AboutPage;
