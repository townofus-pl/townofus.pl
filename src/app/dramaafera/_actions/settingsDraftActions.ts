'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { MAX_SETTINGS_FILE_SIZE_BYTES } from '@/app/api/dramaafera/settings/utils';
import { getSettingsDraft, saveSettingsDraft } from '../_services/settings/settingsDraft';

async function authorize() {
    const auth = await authenticateHeaders(await headers());
    if (!auth.success) throw new Error('Brak autoryzacji.');
}

function failure(error: unknown) {
    const message = error instanceof Error ? error.message : '';
    const known = /^(Brak |Draft lub|Nieprawidłow|Plik |To nie jest|Powtórzony)/;
    return { success: false as const, error: known.test(message) ? message : 'Nie udało się zapisać lub wczytać draftu. Spróbuj ponownie.' };
}

export async function getSettingsDraftAction() {
    try {
        await authorize();
        return { success: true as const, data: await getSettingsDraft() };
    } catch (error) { return failure(error); }
}

export async function saveSettingsDraftAction(content: string, token: string) {
    try {
        await authorize();
        z.string().max(MAX_SETTINGS_FILE_SIZE_BYTES).parse(content);
        z.string().regex(/^(current|draft):\d+:\d+$/).parse(token);
        return { success: true as const, data: await saveSettingsDraft(content, token) };
    } catch (error) { return failure(error); }
}
