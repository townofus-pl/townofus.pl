import { NextRequest } from 'next/server';
import { json, safeHandler, session } from '../../_accounts/server';

export async function GET(request: NextRequest) {
    return safeHandler(async () => {
        const account = await session(request);
        return json({
            success: true,
            data: account
                ? {
                      username: account.username,
                      avatarUrl: account.avatar
                          ? `https://cdn.discordapp.com/avatars/${account.discordUserId}/${account.avatar}.png?size=64`
                          : null,
                  }
                : null,
        });
    });
}
