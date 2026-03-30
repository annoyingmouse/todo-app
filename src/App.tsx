import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import DevNoticeModal from "./components/DevNoticeModal";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TrashPage = lazy(() => import("./pages/TrashPage"));
const DataPage = lazy(() => import("./pages/DataPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const [acknowledged, setAcknowledged] = useState(
    () => localStorage.getItem("dev-notice-acknowledged") === "true",
  );

  return (
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700 focus:rounded focus:shadow"
      >
        Skip to main content
      </a>
      {!acknowledged && (
        <DevNoticeModal onAcknowledge={() => setAcknowledged(true)} />
      )}
      <Navigation />
      <main id="main-content">
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}
export default App;
