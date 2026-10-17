# Fakty z API Discorda dla etapu 1

Research do [#349](https://github.com/townofus-pl/townofus.pl/issues/349) (mapa: [#347](https://github.com/townofus-pl/townofus.pl/issues/347)).
Data: 2026-10-17.

Źródła: dokumentacja Discorda (`docs.discord.com`) i Cloudflare (`developers.cloudflare.com`).
Transport (HTTP interactions na Workers, bez gateway) opisuje research
[#288](https://github.com/townofus-pl/townofus.pl/issues/288), gałąź `research/discord-webhook-vs-bot`,
plik `docs/research/discord-webhook-vs-bot.md`. Tego tu nie powtarzam.

---

## Krótko

| # | Pytanie | Odpowiedź |
|---|---|---|
| 1 | Ankieta z bota | `POST /channels/{id}/messages` z polem `poll`. Do 10 odpowiedzi, `duration` w pełnych godzinach (max 32 dni). Wynik: `GET` wiadomości, pole `poll.results`. Pewny wynik dopiero, gdy `is_finalized` = `true`. Wiadomości z ankietą nie można edytować. Przyciski: osobna wiadomość. |
| 2 | Nick do matcha | `member.nick` → `member.user.global_name` → `member.user.username`. Taką kolejność pokazuje przykład w dokumentacji Discorda. Zapisuj `member.user.id`. |
| 3 | Komenda dla roli „Host” | `default_member_permissions` przyjmuje bity uprawnień, nie rolę. Rolę ustawia admin serwera w kliencie. Worker musi sprawdzić `member.roles`. |
| 4 | Odczyt cudzych ankiet | Bez intencji MESSAGE_CONTENT pole `poll` w cudzej wiadomości jest pominięte. Intencję można włączyć przełącznikiem, bez weryfikacji, poniżej 10 000 użytkowników. Alternatywa bez intencji: komenda w menu kontekstowym wiadomości. |
| 5 | Uprawnienia bota | `VIEW_CHANNEL`, `SEND_MESSAGES`, `SEND_POLLS`, `READ_MESSAGE_HISTORY`. Edycja własnej wiadomości nie wymaga dodatkowych uprawnień. |
| 6 | Cron Triggers | 5 pól, czas UTC, dni tygodnia 1 = niedziela. Free: 5 triggerów na konto, 10 ms CPU na wywołanie. |

**Blokery:** brak twardego blokera. Trzy rzeczy zmieniają plan lub wymagają decyzji:

1. **Koniec ankiety o 17:00 wymaga End Poll.** `duration` to pełne godziny od chwili utworzenia.
   Ankieta z 22:30 nie skończy się dokładnie o 17:00. Cron musi wywołać `End Poll` o 17:00.
2. **Backfill wymaga MESSAGE_CONTENT albo komendy kontekstowej.** Bez tego bot nie zobaczy treści
   ankiet, które wysłał człowiek.
3. **Dni tygodnia w cronie Cloudflare liczą się od niedzieli (1 = SUN).** Środa to `4`, nie `3`.
   Używaj skrótu `WED`.

---

## 1. Ankieta z bota

### Payload

Źródło: [Create Message](https://docs.discord.com/developers/resources/message#create-message),
[Poll Create Request Object](https://docs.discord.com/developers/resources/poll#poll-create-request-object)

> `POST /channels/{channel.id}/messages` … `poll?` | poll request object | A poll!

> | answers | List of Poll Answer Objects | Each of the answers available in the poll, up to 10 |
> | duration? | integer | Number of hours the poll should be open for, up to 32 days. Defaults to 24 |
> | allow\_multiselect? | boolean | Whether a user can select multiple answers. Defaults to false |

> The maximum length of `text` is 300 for the question, and 55 for any answer.

> The `answer_id` is a number that labels each answer. As an implementation detail, it currently
> starts at 1 for the first answer and goes up sequentially. We recommend against depending on this sequence.

Przykład dla etapu 1:

```json
{
  "poll": {
    "question": { "text": "Kto zostanie Emperorem?" },
    "answers": [{ "poll_media": { "text": "Gracz 1" } }, "… do 10 pozycji"],
    "duration": 164,
    "allow_multiselect": false
  }
}
```

**Wniosek:**

- 10 kandydatów mieści się w limicie. Nick gracza musi mieć najwyżej 55 znaków.
- Po utworzeniu zapisz w D1 `message_id` oraz mapę `answer_id` → gracz z odpowiedzi API.
  Nie zakładaj, że `answer_id` idzie od 1.
- `allow_multiselect` decyduje zespół. Domyślnie `false`.

### Czas trwania i 17:00

`duration` to liczba pełnych godzin. Nie ma pola z datą końca w żądaniu.

> The main difference is that the request has `duration` which eventually becomes `expiry`.

Przykład: ankieta z 2026-10-21 22:30 do 2026-10-28 17:00 (Europe/Warsaw) trwa 163,5 h.
W tym tygodniu jest zmiana czasu (25.10), więc różnica w czasie lokalnym (162,5 h) jest błędna.
Liczyć trzeba w UTC.

Źródło: [End Poll](https://docs.discord.com/developers/resources/poll#end-poll)

> `POST /channels/{channel.id}/polls/{message.id}/expire` — Immediately ends the poll.
> You cannot end polls from other users.

**Wniosek:** ustaw `duration` = godziny do 17:00 w UTC, zaokrąglone w górę. Cron o 17:00
(Europe/Warsaw) wywołuje `End Poll`. Bot jest autorem, więc może zakończyć ankietę.

### Odczyt wyniku i `is_finalized`

Źródło: [Poll Results Object](https://docs.discord.com/developers/resources/poll#poll-results-object)

> Also due to the intricacies of counting at scale, while a poll is in progress the results may not
> be perfectly accurate. … after a poll is finished there is a background job which performs a final,
> accurate tally of votes. This tally concludes once `is_finalized` is `true`. Polls that have ended
> will also always contain results.

> If `answer_counts` does not contain an entry for a particular answer, then there are no votes for that answer.

> The `results` field may be not present in certain responses … This should be treated as
> "unknown results", as opposed to "no results".

Źródło: [Get Channel Message](https://docs.discord.com/developers/resources/message#get-channel-message)

> `GET /channels/{channel.id}/messages/{message.id}` … requires the current user to have the
> `VIEW_CHANNEL` and `READ_MESSAGE_HISTORY` permissions.

Po zakończeniu Discord wysyła też wiadomość typu `POLL_RESULT` (46):

> These are automatic messages sent after a poll has ended and the results have been finalized.
> ([Message resource](https://docs.discord.com/developers/resources/message#message-reference-content-attribution-poll-result-messages))

Dokumentacja nie podaje, ile trwa liczenie.

**Wniosek:**

- Cron po 17:00 czyta wiadomość ankiety co 15 min. Zapisuje wynik do D1 dopiero przy
  `poll.results.is_finalized === true`.
- Brak pola `results` to „nie wiem”, nie „zero głosów”. Wtedy cron próbuje ponownie.
- Brak `answer_id` w `answer_counts` = 0 głosów.
- Lista głosujących (jeśli potrzebna): `GET /channels/{id}/polls/{message.id}/answers/{answer_id}`,
  max 100 na stronę, parametr `after`.

### Przyciski na wiadomości z ankietą

Źródło: [Poll endpoints](https://docs.discord.com/developers/resources/poll#poll-endpoints)

> After creation, the poll message cannot be edited.

Źródło: [Component reference](https://docs.discord.com/developers/components/reference)

> To use these components, you need to send the message flag `1 << 15` (IS\_COMPONENTS\_V2) …
> The `poll` and `stickers` fields are disabled

Dokumentacja nie mówi, czy `poll` działa razem ze starymi komponentami (action row bez flagi
`IS_COMPONENTS_V2`). Nie znalazłem zakazu ani potwierdzenia.

**Wniosek:** nie łącz ankiety i przycisków w jednej wiadomości. Plan już zakłada dwie wiadomości
(ankieta + Lista Cweli). Wiadomości z ankietą nie da się później zmienić, więc wyłączenie przycisków
o 18:00 i tak wymaga osobnej wiadomości. To nie jest bloker.

---

## 2. Tożsamość w interakcji

Źródło: [Interaction Object](https://docs.discord.com/developers/interactions/receiving-and-responding#interaction-object)

> | member? | guild member object | Guild member data for the invoking user, including permissions |
> | user? | user object | User object for the invoking user, if invoked in a DM |
>
> `member` is sent when the interaction is invoked in a guild, and `user` is sent when invoked in a DM

Źródło: [Guild Member Object](https://docs.discord.com/developers/resources/guild#guild-member-object)

> | user? | user object | the user this guild member represents |
> | nick? | ?string | this user's guild nickname |
> | roles | array of snowflakes | array of role object ids |

Przykładowy payload interakcji na serwerze ma `member.user` z `id` i `username`
([Application Commands](https://docs.discord.com/developers/interactions/application-commands)).
Przewodnik „Getting Started” czyta ID z `req.body.member.user.id`
([Getting Started](https://docs.discord.com/developers/quick-start/getting-started)).

Źródło: [User Object](https://docs.discord.com/developers/resources/user#user-object)

> | username | string | the user's username, not unique across the platform |
> | global\_name | ?string | the user's display name, if it is set |

> Nicknames must be between 1 and 32 characters long. … Names are sanitized and trimmed of leading,
> trailing, and excessive internal whitespace.

Kolejność wyboru nazwy pokazuje przykład Discorda
([Multiplayer Experience](https://docs.discord.com/developers/activities/development-guides/multiplayer-experience)):

```js
// Retrieve the guild-specific nickname, and fallback to the username#discriminator
const guildNickname = guildsMembersRead?.nick ?? (user.global_name ?? `${user.username}#${user.discriminator}`);
```

**Wniosek:**

- Kolejność: `member.nick ?? member.user.global_name ?? member.user.username`.
  Nowe konta nie mają już `#discriminator` w nazwie, więc sam `username`.
- `nick` i `global_name` mogą być `null` albo ich brak. Obsłuż oba przypadki.
- Klucz to `member.user.id` (snowflake). Nick może się zmienić, ID nie.
- Interakcja niesie nick w chwili kliknięcia. Bot nie musi wołać API ani mieć `GUILD_MEMBERS`.

---

## 3. Komenda tylko dla roli „Host”

Źródło: [Application Commands → Permissions](https://docs.discord.com/developers/interactions/application-commands#permissions)

> The `default_member_permissions` field can be used when creating a command to set the permissions
> a user must have to use it. The value for `default_member_permissions` is a bitwise OR-ed set of
> permissions, serialized as a string. Setting it to `"0"` will prohibit anyone in a guild from using
> the command unless a specific overwrite is configured or the user has admin permissions.

> Command permissions can only be updated using a Bearer token. Authenticating with a bot token will
> result in an error.

> To call the endpoint, apps must use a Bearer token that's authorized with the
> `applications.commands.permissions.update` scope from a user with sufficient permissions. …
> Has permission to Manage Guild and Manage Roles in the guild

> The command permissions interface can be accessed in the client by navigating to
> `Server Settings` > `Integrations`, then clicking `Manage` to the right of an installed app.

> If you don't have permission to use a command, it will not show up in the command picker.
> Members with the Administrator permission can use all commands.

**Wniosek:**

- `default_member_permissions` nie wskazuje roli. Ustaw `"0"`: komenda znika dla wszystkich poza adminami.
- Admin serwera dodaje rolę „Host” w `Server Settings > Integrations` (jednorazowo, ręcznie).
  Bot sam tego nie zrobi, bo token bota dostaje błąd.
- **Worker musi sprawdzić `member.roles.includes(HOST_ROLE_ID)`.** Ustawienia w kliencie zmienia
  każdy admin, a administrator zawsze widzi komendę. `member.roles` to lista ID ról w payloadzie,
  bez dodatkowego wywołania API.
- Do decyzji: czy admin bez roli „Host” może użyć komendy. Dokumentacja tego nie rozstrzyga.

---

## 4. Odczyt cudzych ankiet (backfill 30.09, 7.10, 14.10)

Źródło: [Message Object](https://docs.discord.com/developers/resources/message#message-object)

> An app will receive empty values in the `content`, `embeds`, `attachments`, and `components`
> fields while `poll` will be omitted if they have not configured (or been approved for) the
> `MESSAGE_CONTENT` privileged intent (`1 << 15`).

Źródło: [Gateway → Message Content Intent](https://docs.discord.com/developers/events/gateway#message-content-intent)

> Apps **without** the intent will receive empty values in fields that contain user-inputted content
> with a few exceptions:
> * Content in messages that an app sends
> * Content in DMs with the app
> * Content in which the app is mentioned
> * Content of the message a message context menu command is used on

> HTTP API restrictions are independent of Gateway restrictions, and are unaffected by which intents
> your app passes in the `intents` parameter when Identifying.

Źródło: [Privileged Intent Access Review](https://docs.discord.com/developers/events/gateway#privileged-intent-access-review)

> Apps with fewer than 10,000 users can access privileged intents by enabling them in the Developer Portal.

Źródło: [Getting Started with Privileged Intent Review](https://docs.discord.com/developers/gateway/getting-started-with-privileged-intent-review)

> That threshold is now based on the number of unique users who can see your app across all the
> servers it's in. If that number exceeds 10,000, your app needs to apply for Privileged Intent access.

> even though you *can technically* enable these intents right now, you may only enable what you actually need.

Źródło: [Get Channel Messages](https://docs.discord.com/developers/resources/message#get-channel-messages)

> If the current user is missing the `READ_MESSAGE_HISTORY` permission in the channel, then no
> messages will be returned.

Źródło: [Message Commands](https://docs.discord.com/developers/interactions/application-commands#message-commands)

> They don't take any arguments, and will return the message on whom you clicked or tapped in the interaction response.

**Wniosek:**

- Własna ankieta bota: intencja niepotrzebna (wyjątek „messages that an app sends”).
- Cudze ankiety przez `GET /channels/1331259305881505864/messages`: **bez MESSAGE_CONTENT pole `poll`
  nie przyjdzie.** Intencja działa też dla REST, bez gateway.
- Włączenie: przełącznik w Developer Portal → Bot → Privileged Gateway Intents. Bez weryfikacji,
  dopóki aplikację widzi mniej niż 10 000 unikalnych użytkowników.
- Opcja A: włącz MESSAGE_CONTENT w aplikacji, zrób backfill skryptem, wyłącz intencję.
  Skrypt potrzebuje `VIEW_CHANNEL` i `READ_MESSAGE_HISTORY` na kanale.
- Opcja B, bez intencji: komenda w menu kontekstowym wiadomości (np. „Importuj ankietę”).
  Host klika ją na każdej z trzech ankiet. Bot dostaje całą wiadomość z `poll` w interakcji.
- Opcja C, bez intencji, częściowa: `Get Answer Voters` dla `answer_id` 1–10 daje listy głosujących.
  Nie daje tekstu odpowiedzi, więc nazwiska kandydatów trzeba wpisać ręcznie. Dokumentacja nie
  mówi, czy ten endpoint wymaga MESSAGE_CONTENT, ani jakich uprawnień kanału wymaga.
- Uwaga: stare ankiety mają `is_finalized`. „Polls that have ended will also always contain results.”

---

## 5. Uprawnienia bota na kanale

Źródło: [Permissions](https://docs.discord.com/developers/topics/permissions)

> | VIEW\_CHANNEL | `(1 << 10)` | Allows guild members to view a channel, which includes reading messages in text channels … |
> | SEND\_MESSAGES | `(1 << 11)` | Allows for sending messages in a channel … |
> | READ\_MESSAGE\_HISTORY | `(1 << 16)` | Allows for reading of message history |
> | SEND\_POLLS | `(1 << 49)` | Allows sending polls |

Źródło: [Create Message → Limitations](https://docs.discord.com/developers/resources/message#create-message)

> When operating on a guild channel, the current user must have the `SEND_MESSAGES` permission.

Źródło: [Edit Message](https://docs.discord.com/developers/resources/message#edit-message)

> The fields `content`, `embeds`, `flags` and `components` can be edited by the original message author.
> Other users can only edit `flags` and only if they have the `MANAGE_MESSAGES` permission

Źródło: [Interaction Response Type](https://docs.discord.com/developers/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type)

> | UPDATE\_MESSAGE | 7 | For components, edit the message the component was attached to |

**Wniosek:**

| Uprawnienie | Po co |
|---|---|
| `VIEW_CHANNEL` | dostęp do kanału |
| `SEND_MESSAGES` | wiadomość z Listą Cweli i ankietą |
| `SEND_POLLS` | ankieta |
| `READ_MESSAGE_HISTORY` | odczyt wyniku ankiety (`GET` wiadomości) i backfill |

- Liczba `permissions` do linku instalacji: `562949953489920`.
- `MANAGE_MESSAGES` niepotrzebne. Bot edytuje tylko swoje wiadomości.
- Kliknięcie przycisku: odpowiedź `UPDATE_MESSAGE` (7) zmienia Listę Cweli w tej samej odpowiedzi.
- Wyłączenie przycisków o 18:00 robi cron przez `PATCH /channels/{id}/messages/{id}` z nowymi `components`.
- `MENTION_EVERYONE` tylko, jeśli bot ma pingować `@everyone` lub `@here`.

---

## 6. Cron Triggers w Workers

Źródło: [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

> Cron Triggers execute on UTC time.

> Cloudflare supports cron expressions with five fields, along with most Quartz scheduler-like cron syntax extensions

> Days of the week go from 1 = Sunday to 7 = Saturday, which is different on some other cron systems
> (where 0 = Sunday and 6 = Saturday). To avoid ambiguity you may prefer to use the three-letter
> abbreviations (e.g. `SUN` rather than 1).

> Changes such as adding a new Cron Trigger, updating an old Cron Trigger, or deleting a Cron Trigger
> may take several minutes (up to 15 minutes) to propagate

> You also can set a different Cron Trigger for each environment in your Wrangler configuration file.

Test lokalny: `curl "http://localhost:8787/cdn-cgi/local/scheduled?cron=*+*+*+*+*&time=1745856238000"`.

Źródło: [Scheduled Handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)

> When you configure multiple Cron Triggers for a single Worker, each trigger invokes the same
> `scheduled()` handler. Use `controller.cron` to distinguish which schedule fired

> `controller.scheduledTime` … The time the `ScheduledEvent` was scheduled to be executed in milliseconds since January 1, 1970, UTC.

Źródło: [Limits](https://developers.cloudflare.com/workers/platform/limits/)

> | Number of Cron Triggers per account | 5 | 250 | (Workers Free | Workers Paid)

> | CPU time per Cron Trigger | 10 ms | 30 seconds (< 1 hour interval) 15 min (>= 1 hour interval) |

> | Subrequests per invocation | 50 | 10,000 (up to 10M) |

> Waiting on network requests (such as `fetch()` calls, KV reads, or database queries) does **not** count toward CPU time.

> Scheduled Workers have a maximum wall time of 15 minutes per invocation.

Źródło: [Web standards → Intl](https://developers.cloudflare.com/workers/runtime-apis/web-standards/)

> The `Intl` API allows you to format dates, times, numbers, and more to the format that is used by a provided locale

Strona nie mówi wprost o strefach IANA w `Intl`. Sprawdź `Europe/Warsaw` w `wrangler dev`.

**Wniosek:**

- Cron nie zna strefy czasowej. 22:00 w Warszawie to 20:00 UTC latem i 21:00 UTC zimą.
  Sesja 2026-10-21 jest jeszcze w czasie letnim. Sesja 2026-10-28 jest już w zimowym.
- Najprostszy wariant: jeden trigger `*/15 * * * *` na Worker. Kod liczy czas lokalny
  z `controller.scheduledTime` i decyduje, co zrobić (ankieta, 17:00 End Poll, 18:00 przyciski,
  odczyt wyniku). Wtedy nie ma problemu ze zmianą czasu.
- Wariant węższy: `*/15 20-23 * * WED` dla ankiety plus osobne triggery dla 17:00 i 18:00
  (`0 15,16 * * WED`, `0 16,17 * * WED`) ze sprawdzeniem godziny w kodzie. Zużywa 3 triggery na Worker.
- **Limit Free to 5 triggerów na konto, nie na Worker.** Staging i prod na jednym koncie przy
  wariancie węższym to 6, czyli za dużo. Przy jednym triggerze na Worker to 2.
- Dokumentacja nie opisuje gwarancji „dokładnie raz”. Każdy krok crona musi być idempotentny:
  sprawdź stan w D1 przed wysłaniem ankiety lub `End Poll`.
- 10 ms CPU na Free wystarcza: czas na `fetch()` i D1 się nie liczy. 50 subrequestów
  na wywołanie wystarcza na jedną ankietę i kilka zapytań D1.

---

## Źródła

- https://docs.discord.com/developers/resources/poll
- https://docs.discord.com/developers/resources/message
- https://docs.discord.com/developers/interactions/receiving-and-responding
- https://docs.discord.com/developers/interactions/application-commands
- https://docs.discord.com/developers/resources/guild
- https://docs.discord.com/developers/resources/user
- https://docs.discord.com/developers/topics/permissions
- https://docs.discord.com/developers/events/gateway
- https://docs.discord.com/developers/gateway/you-might-not-need-a-privileged-intent
- https://docs.discord.com/developers/gateway/getting-started-with-privileged-intent-review
- https://docs.discord.com/developers/components/reference
- https://docs.discord.com/developers/activities/development-guides/multiplayer-experience
- https://docs.discord.com/developers/quick-start/getting-started
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/runtime-apis/web-standards/
