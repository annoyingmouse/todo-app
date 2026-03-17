import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import TrashPage from "./pages/TrashPage";
import DataPage from "./pages/DataPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700 focus:rounded focus:shadow"
      >
        Skip to main content
      </a>
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
