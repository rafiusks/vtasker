package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rafaelzasas/vtasker/backend/internal/models"
)

// BoardRepository handles database operations for boards
type BoardRepository struct {
	db *pgxpool.Pool
}

// NewBoardRepository creates a new board repository
func NewBoardRepository(db *pgxpool.Pool) *BoardRepository {
	return &BoardRepository{db: db}
}

// GetBoard retrieves a board by ID
func (r *BoardRepository) GetBoard(ctx context.Context, id string, userID uuid.UUID) (*models.Board, error) {
	var board models.Board
	query := `
		SELECT 
			b.id, 
			b.name,
			b.description,
			b.owner_id,
			b.is_public,
			b.created_at,
			b.updated_at
		FROM boards b
		WHERE b.id = $1 AND (
			b.is_public = true OR
			b.owner_id = $2 OR
			EXISTS (
				SELECT 1 FROM board_members bm
				WHERE bm.board_id = b.id AND bm.user_id = $2
			)
		)`

	err := r.db.QueryRow(ctx, query, id, userID).Scan(
		&board.ID,
		&board.Name,
		&board.Description,
		&board.OwnerID,
		&board.IsPublic,
		&board.CreatedAt,
		&board.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error getting board: %v", err)
	}

	// Get board members
	membersQuery := `
		SELECT 
			bm.board_id,
			bm.user_id,
			bm.role,
			bm.created_at,
			u.name,
			u.email,
			u.avatar_url
		FROM board_members bm
		JOIN users u ON u.id = bm.user_id
		WHERE bm.board_id = $1`

	rows, err := r.db.Query(ctx, membersQuery, board.ID)
	if err != nil {
		return nil, fmt.Errorf("error getting board members: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var member models.BoardMember
		var user models.User
		err := rows.Scan(
			&member.BoardID,
			&member.UserID,
			&member.Role,
			&member.CreatedAt,
			&user.Name,
			&user.Email,
			&user.AvatarURL,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning board member: %v", err)
		}
		member.User = &user
		board.Members = append(board.Members, member)
	}

	// Get tasks for this board
	tasksQuery := `
		SELECT 
			t.id,
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type_id,
			t.owner_id,
			t.parent_id,
			t.order_index,
			t.created_at,
			t.updated_at
		FROM tasks t
		WHERE t.board_id = $1
		ORDER BY t.order_index`

	rows, err = r.db.Query(ctx, tasksQuery, board.ID)
	if err != nil {
		return nil, fmt.Errorf("error getting board tasks: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var task models.Task
		err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Description,
			&task.StatusID,
			&task.PriorityID,
			&task.TypeID,
			&task.OwnerID,
			&task.ParentID,
			&task.OrderIndex,
			&task.CreatedAt,
			&task.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task: %v", err)
		}
		board.Tasks = append(board.Tasks, task)
	}

	return &board, nil
}

// ListBoards retrieves all boards accessible by the user
func (r *BoardRepository) ListBoards(ctx context.Context, userID uuid.UUID) ([]*models.Board, error) {
	query := `
		SELECT DISTINCT
			b.id, 
			b.name,
			b.description,
			b.owner_id,
			b.is_public,
			b.created_at,
			b.updated_at
		FROM boards b
		LEFT JOIN board_members bm ON bm.board_id = b.id
		WHERE b.is_public = true 
		   OR b.owner_id = $1
		   OR bm.user_id = $1
		ORDER BY b.created_at DESC`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("error listing boards: %v", err)
	}
	defer rows.Close()

	var boards []*models.Board
	for rows.Next() {
		var board models.Board
		err := rows.Scan(
			&board.ID,
			&board.Name,
			&board.Description,
			&board.OwnerID,
			&board.IsPublic,
			&board.CreatedAt,
			&board.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning board: %v", err)
		}
		boards = append(boards, &board)
	}

	return boards, nil
}

// GetBoardBySlug retrieves a board by its slug
func (r *BoardRepository) GetBoardBySlug(ctx context.Context, slug string, userID uuid.UUID) (*models.Board, error) {
	var board models.Board
	query := `
		SELECT 
			b.id, 
			b.name,
			b.slug,
			b.description,
			b.owner_id,
			b.is_public,
			b.created_at,
			b.updated_at
		FROM boards b
		WHERE b.slug = $1 AND (
			b.is_public = true OR
			b.owner_id = $2 OR
			EXISTS (
				SELECT 1 FROM board_members bm
				WHERE bm.board_id = b.id AND bm.user_id = $2
			)
		)`

	err := r.db.QueryRow(ctx, query, slug, userID).Scan(
		&board.ID,
		&board.Name,
		&board.Slug,
		&board.Description,
		&board.OwnerID,
		&board.IsPublic,
		&board.CreatedAt,
		&board.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("error getting board: %v", err)
	}

	// Get board members
	membersQuery := `
		SELECT 
			bm.board_id,
			bm.user_id,
			bm.role,
			bm.created_at,
			u.name,
			u.email,
			u.avatar_url
		FROM board_members bm
		JOIN users u ON u.id = bm.user_id
		WHERE bm.board_id = $1`

	rows, err := r.db.Query(ctx, membersQuery, board.ID)
	if err != nil {
		return nil, fmt.Errorf("error getting board members: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var member models.BoardMember
		var user models.User
		err := rows.Scan(
			&member.BoardID,
			&member.UserID,
			&member.Role,
			&member.CreatedAt,
			&user.Name,
			&user.Email,
			&user.AvatarURL,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning board member: %v", err)
		}
		member.User = &user
		board.Members = append(board.Members, member)
	}

	// Get tasks for this board
	tasksQuery := `
		SELECT 
			t.id,
			t.title,
			t.description,
			t.status_id,
			t.priority_id,
			t.type_id,
			t.owner_id,
			t.parent_id,
			t.order_index,
			t.created_at,
			t.updated_at
		FROM tasks t
		WHERE t.board_id = $1
		ORDER BY t.order_index`

	rows, err = r.db.Query(ctx, tasksQuery, board.ID)
	if err != nil {
		return nil, fmt.Errorf("error getting board tasks: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var task models.Task
		err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Description,
			&task.StatusID,
			&task.PriorityID,
			&task.TypeID,
			&task.OwnerID,
			&task.ParentID,
			&task.OrderIndex,
			&task.CreatedAt,
			&task.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning task: %v", err)
		}
		board.Tasks = append(board.Tasks, task)
	}

	return &board, nil
}

// ensureUniqueSlug makes sure the slug is unique by appending a number if needed
func (r *BoardRepository) ensureUniqueSlug(ctx context.Context, slug string) (string, error) {
	var exists bool
	var counter int = 0
	finalSlug := slug

	for {
		err := r.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM boards WHERE slug = $1)", finalSlug).Scan(&exists)
		if err != nil {
			return "", fmt.Errorf("error checking slug existence: %v", err)
		}

		if !exists {
			break
		}

		counter++
		finalSlug = fmt.Sprintf("%s-%d", slug, counter)
	}

	return finalSlug, nil
}

// CreateBoard creates a new board
func (r *BoardRepository) CreateBoard(ctx context.Context, input *models.CreateBoardInput, ownerID uuid.UUID) (*models.Board, error) {
	board := models.NewBoard(*input, ownerID)

	// Ensure unique slug
	uniqueSlug, err := r.ensureUniqueSlug(ctx, board.Slug)
	if err != nil {
		return nil, err
	}
	board.Slug = uniqueSlug

	// Start transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Create board
	query := `
		INSERT INTO boards (id, name, slug, description, owner_id, is_public, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`

	err = tx.QueryRow(ctx, query,
		board.ID,
		board.Name,
		board.Slug,
		board.Description,
		board.OwnerID,
		board.IsPublic,
		board.CreatedAt,
		board.UpdatedAt,
	).Scan(&board.ID)

	if err != nil {
		return nil, fmt.Errorf("error creating board: %v", err)
	}

	// Add members if provided
	if len(input.Members) > 0 {
		membersQuery := `
			INSERT INTO board_members (board_id, user_id, role, created_at)
			VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`

		for _, member := range input.Members {
			_, err = tx.Exec(ctx, membersQuery,
				board.ID,
				member.UserID,
				member.Role,
			)
			if err != nil {
				return nil, fmt.Errorf("error adding board member: %v", err)
			}
		}
	}

	// Commit transaction
	if err = tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("error committing transaction: %v", err)
	}

	return r.GetBoard(ctx, board.ID.String(), ownerID)
}

// UpdateBoard updates an existing board
func (r *BoardRepository) UpdateBoard(ctx context.Context, id string, input *models.UpdateBoardInput, userID uuid.UUID) (*models.Board, error) {
	// Start transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Update board
	query := `
		UPDATE boards
		SET
			name = COALESCE($1, name),
			description = COALESCE($2, description),
			is_public = COALESCE($3, is_public),
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $4 AND (owner_id = $5 OR EXISTS (
			SELECT 1 FROM board_members
			WHERE board_id = $4 AND user_id = $5 AND role = 'admin'
		))
		RETURNING id`

	var boardID uuid.UUID
	err = tx.QueryRow(ctx, query,
		input.Name,
		input.Description,
		input.IsPublic,
		id,
		userID,
	).Scan(&boardID)

	if err != nil {
		return nil, fmt.Errorf("error updating board: %v", err)
	}

	// Update members if provided
	if len(input.Members) > 0 {
		// Remove existing members
		_, err = tx.Exec(ctx, `DELETE FROM board_members WHERE board_id = $1`, boardID)
		if err != nil {
			return nil, fmt.Errorf("error removing board members: %v", err)
		}

		// Add new members
		membersQuery := `
			INSERT INTO board_members (board_id, user_id, role, created_at)
			VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`

		for _, member := range input.Members {
			_, err = tx.Exec(ctx, membersQuery,
				boardID,
				member.UserID,
				member.Role,
			)
			if err != nil {
				return nil, fmt.Errorf("error adding board member: %v", err)
			}
		}
	}

	// Commit transaction
	if err = tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("error committing transaction: %v", err)
	}

	return r.GetBoard(ctx, id, userID)
}

// DeleteBoard deletes a board
func (r *BoardRepository) DeleteBoard(ctx context.Context, id string, userID uuid.UUID) error {
	query := `
		DELETE FROM boards
		WHERE id = $1 AND (owner_id = $2 OR EXISTS (
			SELECT 1 FROM board_members
			WHERE board_id = $1 AND user_id = $2 AND role = 'admin'
		))`

	result, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("error deleting board: %v", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("board not found or user not authorized")
	}

	return nil
} 