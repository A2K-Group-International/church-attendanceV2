import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function UploadedImagesSection({
  images,
  onImageSelect,
  onRename,
  onDelete,
  loadingDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter images based on search term
  const filteredImages = images.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section className="rounded-md border p-4">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border p-2"
        />
      </div>

      {/* Images List */}
      <div className="max-h-60 overflow-auto">
        <ul className="space-y-2">
          {filteredImages.length === 0 ? (
            <p>No images uploaded yet.</p>
          ) : (
            filteredImages.map((item, index) => (
              <li key={index} className="flex items-center justify-between">
                <button
                  onClick={() => onImageSelect(item.url)}
                  aria-label="View Image"
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  {item.name}
                </button>
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
      </div>
    </section>
  );
}
