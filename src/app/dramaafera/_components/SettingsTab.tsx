'use client';

import { useState, useEffect } from 'react';

interface SettingsVersion {
  id: number;
  versionType: 'current' | 'old';
  uploadedAt: string;
  uploadedBy: string | null;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export function SettingsTab() {
  const [currentVersion, setCurrentVersion] = useState<SettingsVersion | null>(null);
  const [oldVersion, setOldVersion] = useState<SettingsVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAdvancedFile, setSelectedAdvancedFile] = useState<File | null>(null);
  const [targetVersion, setTargetVersion] = useState<'current' | 'old'>('current');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dramaafera/settings');
      if (!response.ok) throw new Error('Nie udało się pobrać wersji');

      // Fetch metadata — to będzie osobny endpoint (tymczasowo mockujemy)
      // W przyszłości: GET /api/dramaafera/settings/metadata zwróci wersje z metadanymi
      setCurrentVersion({
        id: 1,
        versionType: 'current',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'system',
      });
      setOldVersion({
        id: 2,
        versionType: 'old',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: 'system',
      });
    } catch (error) {
      console.error('Error fetching versions:', error);
      setMessage({ type: 'error', text: 'Nie udało się pobrać metadanych wersji' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('pl-PL');
  };

  const handleNormalUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Wybierz plik do wgrania' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/dramaafera/settings/upload?mode=normal', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_API_USERNAME || 'demo_user'}:${process.env.NEXT_PUBLIC_API_PASSWORD || 'demo_pass'}`)
        }
      });

      const result = await response.json() as ApiResponse;

      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Błąd podczas wgrywania' });
        return;
      }

      setMessage({ type: 'success', text: result.message || 'Plik wgrany pomyślnie' });
      setSelectedFile(null);
      setTimeout(() => fetchVersions(), 1000);
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage({ type: 'error', text: 'Błąd sieci podczas wgrywania' });
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

      const response = await fetch(`/api/dramaafera/settings/upload?mode=advanced&targetVersion=${targetVersion}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_API_USERNAME || 'demo_user'}:${process.env.NEXT_PUBLIC_API_PASSWORD || 'demo_pass'}`)
        }
      });

      const result = await response.json() as ApiResponse;

      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Błąd podczas wgrywania' });
        return;
      }

      setMessage({ type: 'success', text: result.message || 'Plik wgrany pomyślnie' });
      setSelectedAdvancedFile(null);
      setTimeout(() => fetchVersions(), 1000);
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage({ type: 'error', text: 'Błąd sieci podczas wgrywania' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Ładowanie...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Wersje */}
      <div className="bg-zinc-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Wersje Ustawień</h2>
        <div className="space-y-4">
          {currentVersion && (
            <div className="bg-zinc-700 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-2">✓</span>
                <div>
                  <p className="text-lg font-semibold text-white">Aktualny</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(currentVersion.uploadedAt)}
                    {currentVersion.uploadedBy && ` • wgrany przez: ${currentVersion.uploadedBy}`}
                  </p>
                </div>
              </div>
            </div>
          )}
          {oldVersion && (
            <div className="bg-zinc-700 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-blue-500 text-xl mr-2">✓</span>
                <div>
                  <p className="text-lg font-semibold text-white">Stary</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(oldVersion.uploadedAt)}
                    {oldVersion.uploadedBy && ` • wgrany przez: ${oldVersion.uploadedBy}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
