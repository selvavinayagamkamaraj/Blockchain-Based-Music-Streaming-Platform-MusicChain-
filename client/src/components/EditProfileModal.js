// ✅ src/components/EditProfileModal.js

import React, { useState } from "react";

export default function EditProfileModal({ onClose, onSave, currentName, currentBio }) {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(name, bio);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#111] border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white">
        <h2 className="text-2xl font-semibold mb-6 text-[#1db954] text-center">
          ✏️ Edit Profile
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm text-gray-400">Display Name</label>
            <input
              type="text"
              className="w-full p-3 mt-1 rounded-lg bg-gray-800 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-400">Bio</label>
            <textarea
              rows={4}
              className="w-full p-3 mt-1 rounded-lg bg-gray-800 text-white resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold px-4 py-2 rounded-lg transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
