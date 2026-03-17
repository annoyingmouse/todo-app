import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../sql/db-client";
import type { Task } from "../types/Task";

const DataPage = () => {
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<Task[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const tasks = await taskApi.exportAll();
      const blob = new Blob([JSON.stringify(tasks, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setPendingTasks(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) {
          setImportError("Expected an array of tasks");
          return;
        }
        setPendingTasks(data as Task[]);
      } catch {
        setImportError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!pendingTasks) return;
    setImporting(true);
    try {
      await taskApi.importAll(pendingTasks);
      await queryClient.invalidateQueries();
      setPendingTasks(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = () => {
    setPendingTasks(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Data</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Export</h2>
        <p className="text-sm text-gray-600 mb-3">
          Download all tasks (including deleted ones) as a JSON file.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export database"}
        </button>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Import</h2>
        <p className="text-sm text-gray-600 mb-3">
          Replace the entire database with tasks from a JSON export file. This
          cannot be undone.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="block mb-3"
        />
        {importError && (
          <p className="text-sm text-red-600 mb-3">{importError}</p>
        )}
        {pendingTasks && (
          <div className="border border-yellow-400 bg-yellow-50 rounded p-3">
            <p className="text-sm font-medium mb-2">
              Ready to import {pendingTasks.length} task
              {pendingTasks.length !== 1 ? "s" : ""}. This will overwrite all
              existing data.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {importing ? "Importing…" : "Confirm import"}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-200 text-sm rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DataPage;
