"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type Data = {
  users: string[];
  dates: string[];
  responses: Record<string, boolean[]>;
};

const fetchZapisy = async (): Promise<Data> => {
  const res = await fetch("/api/dramaafera/zapisy", { cache: "no-store" });
  if (!res.ok) {
    throw new Error('Failed to fetch zapisy data');
  }
  const result = await res.json() as { data: Data };
  return result.data;
};

const saveZapisy = async (data: Data) => {
  const res = await fetch("/api/dramaafera/zapisy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to save zapisy data');
  }
  return res.json();
};

export default function ZapisyPage() {
  const [data, setData] = useState<Data | null>(null);
  const [editUser, setEditUser] = useState<string | null>(null);
  const [myName, setMyName] = useState("");
  const [myResponses, setMyResponses] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchZapisy()
      .then(setData)
      .catch((err) => {
        console.error('Error fetching zapisy:', err);
        setError('Nie udało się załadować danych zapisów');
      });
  }, []);

  useEffect(() => {
    if (data && myName && data.users.includes(myName)) {
      setMyResponses([...data.responses[myName]]);
    }
  }, [data, myName]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white p-4">
        <div className="text-red-400">Błąd: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white p-4">
        <div>Ładowanie...</div>
      </div>
    );
  }

  const handleEdit = (user: string) => {
    setEditUser(user);
    setMyName(user);
    setMyResponses([...data.responses[user]]);
  };

  const handleSave = async () => {
    if (!myName) return;
    
    const newData = { ...data };
    newData.responses[myName] = [...myResponses];
    
    setLoading(true);
    setError(null);
    
    try {
      await saveZapisy(newData);
      setData(newData);
      setEditUser(null);
    } catch (err) {
      console.error('Error saving zapisy:', err);
      setError('Nie udało się zapisać zmian');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (idx: number) => {
    setMyResponses((prev) => {
      const arr = [...prev];
      arr[idx] = !arr[idx];
      return arr;
    });
  };

  const totals = data.dates.map((_, i) =>
    data.users.reduce((acc, user) => acc + (data.responses[user][i] ? 1 : 0), 0)
  );

  return (
    <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white overflow-x-auto p-4">
      <h2 className="text-xl font-bold mb-4 text-center font-brook">Zapisy na kolejne tygodnie</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="px-2 py-3 text-left font-semibold">Użytkownik</th>
              {data.dates.map((date, i) => (
                <th key={i} className="px-2 py-3 text-center font-semibold min-w-[100px]">
                  {new Date(date).toLocaleDateString("pl-PL", { 
                    weekday: "short", 
                    day: "numeric", 
                    month: "short" 
                  })}
                </th>
              ))}
              <th className="px-2 py-3 text-center font-semibold">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr 
                key={user} 
                className={`border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors ${
                  editUser === user ? "bg-blue-500/10" : ""
                }`}
              >
                <td className="px-2 py-3 font-semibold">
                  <div className="flex items-center gap-3">
                    <Image
                      src={`/images/avatars/${user}.png`}
                      alt={user}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover bg-gray-200 border border-gray-500 flex-shrink-0"
                      onError={(e) => {
                        // Fallback to a default avatar or hide image on error
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="truncate">{user}</span>
                  </div>
                </td>
                {data.responses[user].map((val, i) => (
                  <td
                    key={i}
                    className={`px-2 py-3 text-center ${
                      val
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {editUser === user ? (
                      <input
                        type="checkbox"
                        checked={myResponses[i]}
                        onChange={() => handleCheck(i)}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    ) : val ? (
                      <span className="text-lg">✔️</span>
                    ) : (
                      <span className="text-lg">❌</span>
                    )}
                  </td>
                ))}
                <td className="px-2 py-3 text-center">
                  {editUser === user ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? "..." : "Zapisz"}
                      </button>
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        onClick={() => setEditUser(null)}
                        disabled={loading}
                      >
                        Anuluj
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      onClick={() => handleEdit(user)}
                    >
                      Edytuj
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-zinc-600 bg-zinc-800/50">
              <td className="px-2 py-3 font-bold">Razem</td>
              {totals.map((t, i) => (
                <td key={i} className="px-2 py-3 text-center font-bold text-blue-400">
                  {t}
                </td>
              ))}
              <td className="px-2 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="mt-6 text-sm text-gray-400 text-center">
        Każdy może edytować tylko swój wiersz. Dane są widoczne dla wszystkich.
      </div>
    </div>
  );
}
