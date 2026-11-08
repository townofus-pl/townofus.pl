'use server';

import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { CURRENT_SEASON } from '../_constants/seasons';
import { getSettingsDraft, saveSettingsDraft } from '../_services/settings/settingsDraft';
import { getRoleProbabilities } from '../_services/rankings/getRoleProbabilities';
import { hasCompleteFactionSample } from '../_utils/roleProbabilities';
import { updateRoleProbabilityConfig } from '../_utils/roleProbabilityConfig';

export async function applyRoleWeightsToDraftAction(seasonId: number) {
    try {
        const auth = await authenticateHeaders(await headers());
        if (!auth.success) return { success: false as const, error: 'Brak autoryzacji.' };
        if (seasonId !== CURRENT_SEASON) return { success: false as const, error: 'Wagi do draftu można zastosować tylko z aktualnego sezonu.' };
        const probabilities = await getRoleProbabilities(seasonId);
        if (!hasCompleteFactionSample(probabilities)) return { success: false as const, error: 'Do zapisania wag potrzeba 20 gier z ustalonym zwycięzcą w każdej z nich.' };
        const draft = await getSettingsDraft();
        const updated = updateRoleProbabilityConfig(draft.content, probabilities.roles);
        if (!draft.exists || updated.content !== draft.content) await saveSettingsDraft(updated.content, draft.token);
        return { success: true as const, updated: updated.updated, disabled: updated.disabled, unmatched: updated.unmatched };
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        const known = /^(Draft lub|Brak |Nieprawidłow|Plik |To nie jest|Powtórzony|W pliku|Nie znaleziono|Brakuje poprawnej)/;
        return { success: false as const, error: known.test(message) ? message : 'Nie udało się zastosować wag w drafcie. Spróbuj ponownie.' };
    }
}
