'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { uploadSettingsAction } from '@/app/dramaafera/_actions/uploadSettingsAction';
import { MAX_SETTINGS_FILE_SIZE_BYTES } from '@/app/api/dramaafera/settings/utils';

function validateClientFile(file: File): string | null {
  if (!file.name.endsWith('.txt')) return 'Plik musi być w formacie .txt';
  if (file.size === 0) return 'Plik nie może być pusty';
  if (file.size > MAX_SETTINGS_FILE_SIZE_BYTES) return 'Plik nie może być większy niż 5MB';
  return null;
}

function parseTargetVersion(value: string): 'current' | 'old' | null {
  return value === 'current' || value === 'old' ? value : null;
}

export function SettingsTab() {
  const [uploading, setUploading] = useState(false);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAdvancedFile, setSelectedAdvancedFile] = useState<File | null>(null);
  const [targetVersion, setTargetVersion] = useState<'current' | 'old'>('current');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const normalFileInputId = useId();
  const advancedFileInputId = useId();
  const advancedPanelId = useId();

  // Guard against setState on unmounted component when the upload finishes
  // after the user has navigated away from the Settings tab.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleNormalUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Wybierz plik do wgrania' });
      return;
    }

    const clientError = validateClientFile(selectedFile);
    if (clientError) {
      setMessage({ type: 'error', text: clientError });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await uploadSettingsAction(formData, 'normal');
      if (!mountedRef.current) return;

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Błąd podczas wgrywania' });
        return;
      }

      setMessage({ type: 'success', text: result.message || 'Plik wgrany pomyślnie' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading:', error);
      if (mountedRef.current) {
        setMessage({ type: 'error', text: 'Błąd podczas wgrywania' });
      }
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  };

  const handleAdvancedUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAdvancedFile) {
      setMessage({ type: 'error', text: 'Wybierz plik do wgrania' });
      return;
    }

    const clientError = validateClientFile(selectedAdvancedFile);
    if (clientError) {
      setMessage({ type: 'error', text: clientError });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);
      const formData = new FormData();
      formData.append('file', selectedAdvancedFile);

      const result = await uploadSettingsAction(formData, 'advanced', targetVersion);
      if (!mountedRef.current) return;

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Błąd podczas wgrywania' });
        return;
      }

      setMessage({ type: 'success', text: result.message || 'Plik wgrany pomyślnie' });
      setSelectedAdvancedFile(null);
    } catch (error) {
      console.error('Error uploading:', error);
      if (mountedRef.current) {
        setMessage({ type: 'error', text: 'Błąd podczas wgrywania' });
      }
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Zwykły upload */}
      <form onSubmit={handleNormalUpload} className="bg-zinc-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Wgraj Plik Ustawień</h3>
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-300">
              ⚠️ Aktualny plik stanie się starym, poprzedni stary zostanie zarchiwizowany (soft-delete).
            </p>
          </div>
          <div>
            <label htmlFor={normalFileInputId} className="block text-sm font-medium text-gray-300 mb-2">
              Wybierz plik .txt
            </label>
            <input
              id={normalFileInputId}
              type="file"
              accept=".txt"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] ?? null);
                setMessage(null);
              }}
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
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {uploading ? 'Wgrywanie...' : 'Wgraj plik ustawień'}
          </button>
        </div>
      </form>

      {/* Zaawansowane opcje */}
      <div className="bg-zinc-800 rounded-lg p-6">
        <button
          type="button"
          onClick={() => setExpandedAdvanced(!expandedAdvanced)}
          aria-expanded={expandedAdvanced}
          aria-controls={advancedPanelId}
          className="w-full text-left flex items-center justify-between"
        >
          <h3 className="text-xl font-bold text-white">Zaawansowane opcje</h3>
          <span className={`transform transition-transform ${expandedAdvanced ? 'rotate-180' : ''}`} aria-hidden="true">
            ▼
          </span>
        </button>

        {expandedAdvanced && (
          <form id={advancedPanelId} onSubmit={handleAdvancedUpload} className="mt-6 space-y-4">
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                ℹ️ Zastąpi tylko wybrany wariant bez rotacji. Poprzedni wariant zostanie zarchiwizowany (soft-delete).
              </p>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-300">Wgraj plik dla:</legend>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="targetVersion"
                    value="current"
                    checked={targetVersion === 'current'}
                    onChange={(e) => {
                      const next = parseTargetVersion(e.target.value);
                      if (next) setTargetVersion(next);
                    }}
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
                    onChange={(e) => {
                      const next = parseTargetVersion(e.target.value);
                      if (next) setTargetVersion(next);
                    }}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Starego (zastąpi obecny old)</span>
                </label>
              </div>
            </fieldset>

            <div>
              <label htmlFor={advancedFileInputId} className="block text-sm font-medium text-gray-300 mb-2">
                Wybierz plik .txt
              </label>
              <input
                id={advancedFileInputId}
                type="file"
                accept=".txt"
                onChange={(e) => {
                  setSelectedAdvancedFile(e.target.files?.[0] ?? null);
                  setMessage(null);
                }}
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
              type="submit"
              disabled={!selectedAdvancedFile || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {uploading ? 'Wgrywanie...' : 'Wgraj (bez rotacji)'}
            </button>
          </form>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
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
