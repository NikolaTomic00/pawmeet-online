ALTER TABLE "messages" ADD COLUMN "read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "messages_receiver_id_read_idx" ON "messages" USING btree ("receiver_id","read");