// src/components/volunteer/VolunteerUpload/UploadedFilesSection.jsx
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function UploadedFilesSection({
  files,
  onRename,
  onDelete,
  loadingDelete,
}) {
  return (
    <section className="rounded-md border p-4">
      <h2 className="mb-2 text-xl font-semibold">📁 Uploaded Files</h2>
      <ul className="space-y-2">
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          files.map((item, index) => (
            <li key={index} className="flex items-center justify-between">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-blue-600 hover:underline"
              >
                {item.name}
              </a>

              <div className="flex space-x-2">
                {/* Rename Icon */}
                <button
                  onClick={() => onRename(item)}
                  aria-label="Rename"
                  className="rounded p-1 hover:bg-gray-200"
                >
                  <FiEdit
                    size={20}
                    className="text-green-600 hover:text-green-400"
                  />
                </button>

                {/* Delete Icon */}
                <button
                  onClick={() => onDelete(item)}
                  aria-label="Delete"
                  className="rounded p-1 hover:bg-gray-200"
                  disabled={loadingDelete}
                >
                  <FiTrash2
                    size={20}
                    className={`text-red-600 hover:text-red-400 ${
                      loadingDelete ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
