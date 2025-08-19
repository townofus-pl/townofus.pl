-- Migration number: 0002 	 2025-08-19T19:05:06.673Z

-- CreateTable
CREATE TABLE "zapisy_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "zapisy_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "zapisy_responses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "attending" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "zapisy_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "zapisy_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "zapisy_responses_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "zapisy_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "zapisy_users_username_key" ON "zapisy_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "zapisy_sessions_date_key" ON "zapisy_sessions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "zapisy_responses_user_id_session_id_key" ON "zapisy_responses"("user_id", "session_id");
