-- Activate all existing users who are currently INACTIVE
-- This fixes users who registered but couldn't login due to INACTIVE status

UPDATE public."user"
SET record_status = 'ACTIVE',
    stamp = LEFT('ACTIVATED ' || userId || ' ' || NOW()::text, 60)
WHERE record_status = 'INACTIVE';