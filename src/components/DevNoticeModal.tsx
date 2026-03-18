import { useEffect, useRef } from "react";

const STORAGE_KEY = "dev-notice-acknowledged";

type Props = {
  onAcknowledge: () => void;
};

const DevNoticeModal = ({ onAcknowledge }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onAcknowledge();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => e.preventDefault()}
      aria-labelledby="dev-notice-title"
      className="rounded-lg shadow-xl max-w-md w-full p-6 backdrop:bg-black/60"
    >
      <h2
        id="dev-notice-title"
        className="text-xl font-bold text-yellow-700 mb-3"
      >
        <span aria-hidden="true">⚠</span> Under active development
      </h2>
      <p className="text-gray-700 mb-3">
        This app is a work in progress. Features may change or break without
        warning, and <strong>stored data may be lost at any time</strong> — for
        example when the database schema is updated or browser storage is
        cleared.
      </p>
      <p className="text-gray-700 mb-6">
        Do not rely on this app to store important data.
      </p>
      <button
        onClick={handleAcknowledge}
        className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded"
        autoFocus
      >
        I understand, continue
      </button>
    </dialog>
  );
};

export default DevNoticeModal;
