import { getPrismaClient } from '@/app/api/_database';

// Initial data from the attachment
const initialData = {
  "users": [
    "AlerGeek", "Anterias", "Asiptus", "Atre", "Barox24", "Bartek", "brubel", 
    "Cleopatrie", "DawDu", "Dimnei", "DrLaren", "Dusia", "Dziekansqr", 
    "Fastovsky", "Fearu", "GIMPER 2", "Hosshin", "Ignorancky", "Jakubeq", 
    "KitssueUxU", "KiwiSpice", "Malkiz", "Mamika", "MikoTheOwl", "Miras", 
    "MokraJola", "Mostu", "nevs", "Olivka", "Orzehh", "Pacia", "Ph4", 
    "podejrzANA", "Quarties", "QuietGum", "silo", "siupax", "smoqu", 
    "Tabakuba", "Zieloony", "ziomson"
  ],
  "dates": [
    "2025-07-23",
    "2025-07-30", 
    "2025-08-06",
    "2025-08-13",
    "2025-08-20"
  ]
};

export async function initializeZapisyData(db: D1Database) {
  const prisma = getPrismaClient(db);
  
  try {
    // Create users
    for (const username of initialData.users) {
      await prisma.zapisyUser.upsert({
        where: { username },
        update: {},
        create: { username }
      });
    }

    // Create sessions
    for (const dateStr of initialData.dates) {
      const date = new Date(dateStr);
      await prisma.zapisySession.upsert({
        where: { date },
        update: {},
        create: { date }
      });
    }

    console.log('Zapisy data initialized successfully');
    return { success: true, message: 'Data initialized' };
  } catch (error) {
    console.error('Error initializing zapisy data:', error);
    throw error;
  }
}
