import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleColor } from "../../_services/gameDataService";
import { Roles } from "@/roles";

// Helper function to convert role name to URL-friendly format
function convertRoleToUrlSlug(role: string): string {
    return role.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
}



interface RolePageProps {
    params: Promise<{
        nazwa: string;
    }>;
}

export async function generateStaticParams() {
    // Return empty array during build time as Cloudflare context is not available
    // This will be populated at runtime
    return [];
}

export default async function RoleStatsPage({ params }: RolePageProps) {
    const { nazwa } = await params;
    
    // Find the role by slug
    const role = Roles.find(r => 
        convertRoleToUrlSlug(r.name) === nazwa.toLowerCase() ||
        convertRoleToUrlSlug(r.id) === nazwa.toLowerCase()
    );
    
    if (!role) {
        notFound();
    }

    const roleColor = getRoleColor(role.name);

    return (
        <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md rounded-t-xl border-b border-zinc-700/50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link 
                        href="/dramaafera-new/role"
                        className="text-white hover:text-gray-300 transition-colors mb-4 inline-flex items-center gap-2"
                    >
                        ← Powrót do listy ról
                    </Link>
                    <h1 className="text-4xl font-bold text-white">
                        Statystyki roli: {role.name}
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Main role section */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Role Icon */}
                        <div className="flex-shrink-0">
                            <div 
                                className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-6xl"
                                style={{ 
                                    borderColor: roleColor,
                                    backgroundColor: `${roleColor}20`
                                }}
                            >
                                <span style={{ color: roleColor }}>👤</span>
                            </div>
                        </div>

                        {/* Role Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 
                                className="text-4xl font-bold mb-2"
                                style={{ color: roleColor }}
                            >
                                {role.name}
                            </h2>
                            <div className="text-lg text-gray-400 mb-4">
                                Drużyna: <span style={{ color: roleColor }}>{role.team}</span>
                            </div>
                            
                            {/* Role Description */}
                            <div className="text-gray-300 mb-6">
                                <div className="prose prose-invert max-w-none">
                                    {role.description}
                                </div>
                            </div>

                            {/* Role Tip */}
                            {role.tip && (
                                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-4">
                                    <h4 className="text-blue-300 font-semibold mb-2">💡 Wskazówka:</h4>
                                    <p className="text-blue-100">{role.tip}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Role Abilities */}
                {role.abilities && role.abilities.length > 0 && (
                    <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-8 mb-6">
                        <h3 className="text-2xl font-bold mb-4">🎯 Zdolności</h3>
                        <div className="grid gap-4">
                            {role.abilities.map((ability, index) => (
                                <div 
                                    key={index}
                                    className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/30 flex items-center gap-4"
                                >
                                    <div className="flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={ability.icon} 
                                            alt={ability.name}
                                            className="w-12 h-12"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white">
                                            {ability.name}
                                        </h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Role Settings */}
                {role.settings && Object.keys(role.settings).length > 0 && (
                    <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-8 mb-6">
                        <h3 className="text-2xl font-bold mb-4">⚙️ Ustawienia</h3>
                        <div className="grid gap-4">
                            {Object.entries(role.settings).map(([key, setting]) => (
                                <div 
                                    key={key}
                                    className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/30 flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="text-lg font-semibold text-white">
                                            {key}
                                        </h4>
                                        <p className="text-gray-400 text-sm">
                                            Wartość: {typeof setting.value === 'boolean' ? (setting.value ? 'Tak' : 'Nie') : setting.value}
                                        </p>
                                    </div>
                                    <div className="text-gray-300">
                                        <span className="font-mono bg-zinc-700/50 px-2 py-1 rounded">
                                            {setting.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Statistics Placeholder */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-8">
                    <h3 className="text-2xl font-bold mb-4">📊 Statystyki</h3>
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">📈</div>
                        <h4 className="text-xl font-semibold text-gray-300 mb-2">
                            Statystyki w trakcie implementacji
                        </h4>
                        <p className="text-gray-400">
                            Szczegółowe statystyki dla tej roli będą dostępne wkrótce.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}