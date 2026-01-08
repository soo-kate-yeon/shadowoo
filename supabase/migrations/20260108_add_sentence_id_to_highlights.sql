-- Add sentence_id column to highlights table
ALTER TABLE public.highlights
  ADD COLUMN sentence_id text;

-- Optional index for faster queries
CREATE INDEX IF NOT EXISTS highlights_sentence_id_idx ON public.highlights(sentence_id);
