package repository

import (
	"context"
	"fmt"
	"strings"

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
			b.slug,
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
		&board.Slug,
		&board.Description,
		&board.OwnerID,
		&board.IsPublic,
		&board.CreatedAt,
		&board.UpdatedAt,
	)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, fmt.Errorf("board not found")
		}
		return nil, fmt.Errorf("error getting board: %v", err)
	}

	// Get board members
	membersQuery := `
		SELECT 
			bm.board_id,
			bm.user_id,
			bm.role,
			bm.created_at,
			u.full_name,
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
			&user.FullName,
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
			b.slug,
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
			&board.Slug,
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
		if err.Error() == "no rows in result set" {
			return nil, fmt.Errorf("board not found")
		}
		return nil, fmt.Errorf("error getting board: %v", err)
	}

	// Get board members
	membersQuery := `
		SELECT 
			bm.board_id,
			bm.user_id,
			bm.role,
			bm.created_at,
			u.full_name,
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
			&user.FullName,
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

// ErrBoardNameExists is returned when attempting to create a board with a name that already exists
var ErrBoardNameExists = fmt.Errorf("board name already exists")

// CreateBoard creates a new board
func (r *BoardRepository) CreateBoard(ctx context.Context, input *models.CreateBoardInput, ownerID uuid.UUID) (*models.Board, error) {
	// Generate initial slug from input or board name
	slug := input.Slug
	if slug == "" {
		slug = models.GenerateSlug(input.Name)
	}

	// Ensure the slug is unique
	uniqueSlug, err := r.ensureUniqueSlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("error ensuring unique slug: %v", err)
	}

	// Create the board
	board := models.NewBoard(*input, ownerID)
	board.Slug = uniqueSlug

	query := `
		INSERT INTO boards (
			id,
			name,
			slug,
			description,
			owner_id,
			is_public,
			created_at,
			updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, name, slug, description, owner_id, is_public, created_at, updated_at`

	err = r.db.QueryRow(
		ctx,
		query,
		board.ID,
		board.Name,
		board.Slug,
		board.Description,
		board.OwnerID,
		board.IsPublic,
		board.CreatedAt,
		board.UpdatedAt,
	).Scan(
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
		if strings.Contains(err.Error(), "SQLSTATE 23505") {
			return nil, ErrBoardNameExists
		}
		return nil, fmt.Errorf("error creating board: %v", err)
	}

	// Add members if provided
	if len(input.Members) > 0 {
		membersQuery := `
			INSERT INTO board_members (board_id, user_id, role, created_at)
			VALUES ($1, $2, $3, $4)`

		for _, member := range input.Members {
			_, err = r.db.Exec(
				ctx,
				membersQuery,
				board.ID,
				member.UserID,
				member.Role,
				board.CreatedAt,
			)
			if err != nil {
				return nil, fmt.Errorf("error adding board member: %v", err)
			}
		}
	}

	return board, nil
}

// ensureUniqueSlug ensures the slug is unique by appending a number if necessary
func (r *BoardRepository) ensureUniqueSlug(ctx context.Context, slug string) (string, error) {
	var count int
	query := `SELECT COUNT(*) FROM boards WHERE slug = $1`
	err := r.db.QueryRow(ctx, query, slug).Scan(&count)
	if err != nil {
		return "", fmt.Errorf("error checking slug uniqueness: %v", err)
	}

	if count == 0 {
		return slug, nil
	}

	// If slug exists, append a number
	i := 1
	for {
		newSlug := fmt.Sprintf("%s-%d", slug, i)
		err = r.db.QueryRow(ctx, query, newSlug).Scan(&count)
		if err != nil {
			return "", fmt.Errorf("error checking slug uniqueness: %v", err)
		}
		if count == 0 {
			return newSlug, nil
		}
		i++
	}
}

// UpdateBoard updates an existing board
func (r *BoardRepository) UpdateBoard(ctx context.Context, id string, input *models.UpdateBoardInput, userID uuid.UUID) (*models.Board, error) {
	// Start transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// If slug is provided, ensure it's unique
	if input.Slug != nil {
		uniqueSlug, err := r.ensureUniqueSlug(ctx, *input.Slug)
		if err != nil {
			return nil, fmt.Errorf("error ensuring unique slug: %v", err)
		}
		input.Slug = &uniqueSlug
	}

	// Update board
	query := `
		UPDATE boards
		SET
			name = COALESCE($1, name),
			slug = COALESCE($2, slug),
			description = COALESCE($3, description),
			is_public = COALESCE($4, is_public),
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $5 AND (owner_id = $6 OR EXISTS (
			SELECT 1 FROM board_members
			WHERE board_id = $5 AND user_id = $6 AND role = 'admin'
		))
		RETURNING id`

	var boardID uuid.UUID
	err = tx.QueryRow(ctx, query,
		input.Name,
		input.Slug,
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
func (r *BoardRepository) DeleteBoard(ctx context.Context, id string, userID uuid.UUID, isSuperAdmin bool) error {
	// First check if the board exists and the user has permission to delete it
	var ownerID uuid.UUID
	var isPublic bool
	err := r.db.QueryRow(ctx, `
		SELECT owner_id, is_public
		FROM boards
		WHERE id = $1
	`, id).Scan(&ownerID, &isPublic)

	if err != nil {
		if err.Error() == "no rows in result set" {
			return fmt.Errorf("board not found")
		}
		return fmt.Errorf("error checking board: %v", err)
	}

	// Check if user has permission to delete
	if !isSuperAdmin && ownerID != userID {
		// Check if user is a board admin
		var isAdmin bool
		err := r.db.QueryRow(ctx, `
			SELECT EXISTS (
				SELECT 1 FROM board_members
				WHERE board_id = $1 AND user_id = $2 AND role = 'admin'
			)
		`, id, userID).Scan(&isAdmin)

		if err != nil {
			return fmt.Errorf("error checking permissions: %v", err)
		}

		if !isAdmin {
			return fmt.Errorf("unauthorized")
		}
	}

	// Delete the board
	result, err := r.db.Exec(ctx, "DELETE FROM boards WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("error deleting board: %v", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("board not found")
	}

	return nil
}

// ListAllBoards retrieves all boards in the system (super admin only)
func (r *BoardRepository) ListAllBoards(ctx context.Context) ([]*models.Board, error) {
	query := `
		SELECT DISTINCT
			b.id, 
			b.name,
			b.slug,
			b.description,
			b.owner_id,
			b.is_public,
			b.created_at,
			b.updated_at
		FROM boards b
		ORDER BY b.created_at DESC`

	rows, err := r.db.Query(ctx, query)
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
			&board.Slug,
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