"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type Data = {
  users: string[];
  dates: string[];
  responses: Record<string, boolean[]>;
};

const fetchZapisy = async (): Promise<Data> => {
  const res = await fetch("/dramaafera/zapisy/api", { cache: "no-store" });
  return res.json();
};

const saveZapisy = async (data: Data) => {
  await fetch("/dramaafera/zapisy/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export default function ZapisyPage() {
  const [data, setData] = useState<Data | null>(null);
  const [editUser, setEditUser] = useState<string | null>(null);
  const [myName, setMyName] = useState("");
  const [myResponses, setMyResponses] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchZapisy().then(setData);
  }, []);

  useEffect(() => {
    if (data && myName && data.users.includes(myName)) {
      setMyResponses([...data.responses[myName]]);
    }
  }, [data, myName]);

  if (!data) return <div>Ładowanie...</div>;

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
    await saveZapisy(newData);
    setData(newData);
    setEditUser(null);
    setLoading(false);
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
      <h2 className="text-xl font-bold mb-4">Zapisy na kolejne tygodnie</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left">Użytkownik</th>
            {data.dates.map((date, i) => (
              <th key={i} className="px-2 py-1">
                {new Date(date).toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "short" })}
              </th>
            ))}
            <th className="px-2 py-1">Edytuj</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <tr key={user} className={editUser === user ? "bg-white-300" : ""}>
              <td className="px-2 py-1 font-semibold flex items-center gap-2">
                <Image
                  src={`/images/avatars/${user}.png`}
                  alt={user}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover bg-gray-200 border border-gray-500"
                  // onError is not supported by next/image; fallback logic should be handled differently if needed
                />
                {user}
              </td>
              {data.responses[user].map((val, i) => (
                <td
                  key={i}
                  className={
                    "px-2 py-1 text-center " +
                        (val
                          ? "bg-green-600 bg-opacity-20"
                          : "bg-red-500 bg-opacity-20")
                  }
                >
                  {editUser === user ? (
                    <input
                      type="checkbox"
                      checked={myResponses[i]}
                      onChange={() => handleCheck(i)}
                    />
                  ) : val ? (
                    <span>✔️</span>
                  ) : (
                    <span>❌</span>
                  )}
                </td>
              ))}
              <td className="px-2 py-1">
                {editUser === user ? (
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    Zapisz
                  </button>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
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
          <tr>
            <td className="px-2 py-1 font-bold">Razem</td>
            {totals.map((t, i) => (
              <td key={i} className="px-2 py-1 text-center font-bold">{t}</td>
            ))}
            <td className="px-2 py-1"></td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-4 text-sm text-gray-500">Każdy może edytować tylko swój wiersz. Dane są widoczne dla wszystkich.</div>
    </div>
  );
}
