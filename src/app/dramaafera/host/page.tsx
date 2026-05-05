import { readdirSync } from 'fs';
import { join } from 'path';
import { getGameDatesLightweight, generateRoleRankingStats } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import HostTabs from "@/app/dramaafera/_components/HostTabs";

/**
 * Get list of available player avatars from /public/images/avatars
 */
function getAvailableAvatars(): string[] {
  try {
    const avatarDir = join(process.cwd(), 'public', 'images', 'avatars');
    const files = readdirSync(avatarDir);
    
    // Extract player names from filenames (remove .png extension)
    // Exclude placeholder.png
    return files
      .filter((file) => file.endsWith('.png') && file !== 'placeholder.png')
      .map((file) => file.replace('.png', ''))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  } catch (error) {
    console.error('Error reading avatars directory:', error);
    return [];
  }
}

export default async function HostPage() {
    const seasonId = CURRENT_SEASON;
    const { dates } = await getGameDatesLightweight(false, seasonId);
    const roles = await generateRoleRankingStats(seasonId);
    const availableAvatars = getAvailableAvatars();

    return <HostTabs initialDates={dates} seasonId={seasonId} roles={roles} availableAvatars={availableAvatars} />;
}
