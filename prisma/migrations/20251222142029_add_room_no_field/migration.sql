/*
  Warnings:

  - A unique constraint covering the columns `[room_no]` on the table `room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `room_no` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- Add the column as nullable first
ALTER TABLE "room" ADD COLUMN IF NOT EXISTS "room_no" VARCHAR(50);

-- Set default values for existing rooms (if any)
DO $$
DECLARE
  room_rec RECORD;
  counter INTEGER := 1;
BEGIN
  FOR room_rec IN SELECT id, name, created_at FROM "room" WHERE "room_no" IS NULL ORDER BY created_at
  LOOP
    UPDATE "room" 
    SET "room_no" = CASE 
      WHEN room_rec.name LIKE 'Room %' THEN UPPER(REPLACE(room_rec.name, 'Room ', 'R'))
      WHEN room_rec.name LIKE 'R%' THEN UPPER(room_rec.name)
      ELSE 'R' || LPAD(counter::text, 3, '0')
    END
    WHERE id = room_rec.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make the column NOT NULL
ALTER TABLE "room" ALTER COLUMN "room_no" SET NOT NULL;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "room_room_no_key" ON "room"("room_no");
