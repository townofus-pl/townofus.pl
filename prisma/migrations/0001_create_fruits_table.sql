-- CreateTable
CREATE TABLE "fruits" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT,
    "in_stock" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX "idx_fruits_name" ON "fruits"("name");
CREATE INDEX "idx_fruits_color" ON "fruits"("color");
CREATE INDEX "idx_fruits_in_stock" ON "fruits"("in_stock");
