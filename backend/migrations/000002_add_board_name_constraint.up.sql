-- First, update duplicate board names by appending a number
WITH duplicates AS (
    SELECT
        id,
        name,
        owner_id,
        ROW_NUMBER() OVER (
            PARTITION BY name,
            owner_id
            ORDER BY
                created_at
        ) as rn
    FROM
        boards
    WHERE
        (name, owner_id) IN (
            SELECT
                name,
                owner_id
            FROM
                boards
            GROUP BY
                name,
                owner_id
            HAVING
                COUNT(*) > 1
        )
)
UPDATE
    boards b
SET
    name = b.name || ' (' || d.rn || ')'
FROM
    duplicates d
WHERE
    b.id = d.id
    AND d.rn > 1;

-- Now add the unique constraint
ALTER TABLE
    boards
ADD
    CONSTRAINT unique_board_name_per_owner UNIQUE (name, owner_id);