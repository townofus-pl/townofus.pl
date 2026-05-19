'use client';

import { useState } from 'react';
import { uploadSettingsAction } from '@/app/dramaafera/_actions/uploadSettingsAction';

export function SettingsTab() {
  const [uploading, setUploading] = useState(false);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAdvancedFile, setSelectedAdvancedFile] = useState<File | null>(null);
  const [targetVersion, setTargetVersion] = useState<'current' | 'old'>('current');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNormalUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Wybierz plik do wgrania' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await uploadSettingsAction(formData, 'normal');

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Błąd podczas wgrywania' });
        return;
      }

      setMessage({ type: 'success', text: result.message || 'Plik wgrany pomyślnie' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage({ type: 'error', text: 'Błąd podczas wgrywania' });
    } finally {
      setUploading(false);
    }
  };

  const handleAdvancedUpload = async () => {
    if (!selectedAdvancedFile) {
      setMessage({ type: 'error', text: 'Wybierz plik do wgrania' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedAdvancedFile);

      const result = await uploadSettingsAction(formData, 'advanced', targetVersion);

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Błąd podczas wgrywania' });
        return;
      }

      setMessage({ type: 'success', text: result.message || 'Plik wgrany pomyślnie' });
      setSelectedAdvancedFile(null);
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage({ type: 'error', text: 'Błąd podczas wgrywania' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Zwykły upload */}
      <div className="bg-zinc-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Wgraj Plik Ustawień</h3>
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-300">
              ⚠️ Aktualny plik stanie się starym, poprzedni stary będzie usunięty z bazy.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Wybierz plik .txt</label>
            <input
              type="file"
              accept=".txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={uploading}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-yellow-600 file:text-white
                hover:file:bg-yellow-700
                disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleNormalUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {uploading ? 'Wgrywanie...' : 'Wgraj plik ustawień'}
          </button>
        </div>
      </div>

      {/* Zaawansowane opcje */}
      <div className="bg-zinc-800 rounded-lg p-6">
        <button
          onClick={() => setExpandedAdvanced(!expandedAdvanced)}
          className="w-full text-left flex items-center justify-between"
        >
          <h3 className="text-xl font-bold text-white">Zaawansowane opcje</h3>
          <span className={`transform transition-transform ${expandedAdvanced ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedAdvanced && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                ℹ️ Zastąpi tylko wybrany wariant bez rotacji. Poprzedni wariant będzie usunięty z bazy.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Wgraj plik dla:</p>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="targetVersion"
                    value="current"
                    checked={targetVersion === 'current'}
                    onChange={(e) => setTargetVersion(e.target.value as 'current' | 'old')}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Aktualnego (zastąpi obecny current)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="targetVersion"
                    value="old"
                    checked={targetVersion === 'old'}
                    onChange={(e) => setTargetVersion(e.target.value as 'current' | 'old')}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Starego (zastąpi obecny old)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Wybierz plik .txt</label>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => setSelectedAdvancedFile(e.target.files?.[0] || null)}
                disabled={uploading}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleAdvancedUpload}
              disabled={!selectedAdvancedFile || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {uploading ? 'Wgrywanie...' : 'Wgraj (bez rotacji)'}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-700 text-green-300'
              : 'bg-red-900/20 border border-red-700 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
