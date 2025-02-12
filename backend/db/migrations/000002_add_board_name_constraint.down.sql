-- Remove unique constraint on board name per owner
ALTER TABLE
    boards DROP CONSTRAINT IF EXISTS unique_board_name_per_owner;