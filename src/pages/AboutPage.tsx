type Column = {
  badge: "PK" | "FK" | null;
  name: string;
  type: string;
  nullable: boolean;
};

const COLUMNS: Column[] = [
  { badge: "PK", name: "id", type: "INTEGER", nullable: false },
  { badge: null, name: "title", type: "TEXT", nullable: false },
  { badge: null, name: "description", type: "TEXT", nullable: false },
  { badge: null, name: "completed", type: "INTEGER", nullable: false },
  { badge: null, name: "date_completed", type: "TEXT", nullable: true },
  { badge: "FK", name: "parent_id", type: "INTEGER", nullable: true },
  { badge: null, name: "deleted_at", type: "TEXT", nullable: true },
];

function ERDiagram() {
  const ROW_H = 28;
  const HEADER_H = 32;
  const BOX_X = 50;
  const BOX_Y = 25;
  const BOX_W = 300;
  const BOX_H = HEADER_H + COLUMNS.length * ROW_H;
  const ARROW_START_X = BOX_X + BOX_W;
  const ARROW_TIP_X = ARROW_START_X + 60;

  const rowTopY = (i: number) => BOX_Y + HEADER_H + i * ROW_H;
  const rowMidY = (i: number) => rowTopY(i) + ROW_H / 2;

  const pkY = rowMidY(0);
  const fkY = rowMidY(COLUMNS.findIndex((c) => c.badge === "FK"));
  const midY = (pkY + fkY) / 2;

  const SVG_W = ARROW_TIP_X + 60;
  const SVG_H = BOX_Y + BOX_H + 25;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full max-w-xl"
      role="img"
      aria-labelledby="er-title er-desc"
    >
      <title id="er-title">
        Entity–relationship diagram for the tasks table
      </title>
      <desc id="er-desc">
        A single &quot;tasks&quot; table with columns: id (primary key), title,
        description, completed, date_completed (nullable), parent_id (foreign
        key, nullable, self-referential), and deleted_at (nullable). The
        parent_id column references id with a 0..1 to 0..* relationship,
        representing subtasks.
      </desc>
      {/* Entity box */}
      <rect
        x={BOX_X}
        y={BOX_Y}
        width={BOX_W}
        height={BOX_H}
        fill="white"
        stroke="#374151"
        strokeWidth="1.5"
        rx="3"
      />

      {/* Header */}
      <rect
        x={BOX_X}
        y={BOX_Y}
        width={BOX_W}
        height={HEADER_H}
        fill="#1f2937"
        rx="3"
      />
      {/* Cover bottom-radius of header */}
      <rect
        x={BOX_X}
        y={BOX_Y + HEADER_H - 4}
        width={BOX_W}
        height={4}
        fill="#1f2937"
      />
      <text
        x={BOX_X + BOX_W / 2}
        y={BOX_Y + HEADER_H - 10}
        textAnchor="middle"
        fill="white"
        fontWeight="bold"
        fontSize="13"
        fontFamily="monospace"
      >
        tasks
      </text>

      {/* Column rows */}
      {COLUMNS.map((col, i) => {
        const top = rowTopY(i);
        const mid = rowMidY(i);
        return (
          <g key={col.name}>
            {i > 0 && (
              <line
                x1={BOX_X}
                y1={top}
                x2={BOX_X + BOX_W}
                y2={top}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            )}

            {/* PK / FK badge */}
            {col.badge && (
              <>
                <rect
                  x={BOX_X + 7}
                  y={mid - 9}
                  width={26}
                  height={18}
                  rx="2"
                  fill={col.badge === "PK" ? "#fef3c7" : "#dbeafe"}
                  stroke={col.badge === "PK" ? "#d97706" : "#3b82f6"}
                  strokeWidth="0.75"
                />
                <text
                  x={BOX_X + 20}
                  y={mid + 5}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={col.badge === "PK" ? "#92400e" : "#1e40af"}
                >
                  {col.badge}
                </text>
              </>
            )}

            {/* Column name */}
            <text
              x={BOX_X + 42}
              y={mid + 5}
              fontSize="12"
              fontFamily="monospace"
              fill="#111827"
            >
              {col.name}
            </text>

            {/* Type + nullability */}
            <text
              x={BOX_X + BOX_W - 8}
              y={mid + 5}
              textAnchor="end"
              fontSize="11"
              fontFamily="monospace"
              fill={col.nullable ? "#9ca3af" : "#6b7280"}
            >
              {col.type}
              {col.nullable ? "" : " NN"}
            </text>
          </g>
        );
      })}

      {/* Self-referential arrow: parent_id → id */}
      <path
        d={`M ${ARROW_START_X},${fkY} L ${ARROW_TIP_X},${fkY} L ${ARROW_TIP_X},${pkY} L ${ARROW_START_X},${pkY}`}
        fill="none"
        stroke="#6b7280"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      {/* Arrowhead pointing left into id row */}
      <polygon
        points={`${ARROW_START_X},${pkY} ${ARROW_START_X + 8},${pkY - 5} ${ARROW_START_X + 8},${pkY + 5}`}
        fill="#6b7280"
      />

      {/* Cardinality labels */}
      <text
        x={ARROW_TIP_X + 5}
        y={pkY - 4}
        fontSize="10"
        fontFamily="sans-serif"
        fill="#6b7280"
      >
        0..*
      </text>
      <text
        x={ARROW_TIP_X + 5}
        y={fkY + 14}
        fontSize="10"
        fontFamily="sans-serif"
        fill="#6b7280"
      >
        0..1
      </text>

      {/* Relationship label, rotated along the vertical segment */}
      <text
        x={ARROW_TIP_X + 8}
        y={midY}
        fontSize="10"
        fontFamily="sans-serif"
        fill="#9ca3af"
        textAnchor="middle"
        transform={`rotate(-90, ${ARROW_TIP_X + 8}, ${midY})`}
      >
        subtask of
      </text>

      {/* Legend */}
      <g transform={`translate(${BOX_X}, ${BOX_Y + BOX_H + 10})`}>
        <rect
          x="0"
          y="0"
          width="16"
          height="12"
          rx="1"
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth="0.75"
        />
        <text
          x="20"
          y="10"
          fontSize="10"
          fontFamily="sans-serif"
          fill="#6b7280"
        >
          Primary key
        </text>
        <rect
          x="90"
          y="0"
          width="16"
          height="12"
          rx="1"
          fill="#dbeafe"
          stroke="#3b82f6"
          strokeWidth="0.75"
        />
        <text
          x="110"
          y="10"
          fontSize="10"
          fontFamily="sans-serif"
          fill="#6b7280"
        >
          Foreign key
        </text>
        <text
          x="200"
          y="10"
          fontSize="10"
          fontFamily="monospace"
          fill="#9ca3af"
        >
          NN = NOT NULL
        </text>
      </g>
    </svg>
  );
}

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

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Data model</h2>
        <ERDiagram />
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
                className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                {name}
                <span aria-hidden="true" className="text-xs">
                  ↗
                </span>
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
