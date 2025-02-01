# vTasker Directory Structure

This document outlines the directory structure and organization of the vTasker project.

## Root Directory Structure

```
vTasker/
├── .vtask/               # Project management and metadata
│   ├── docs/            # Project documentation
│   ├── logs/            # Development and runtime logs
│   ├── tasks/           # Task definitions and tracking
│   └── templates/       # Templates and schemas
│       ├── examples/    # Example files for templates
│       └── schemas/     # JSON validation schemas
├── src/                 # Source code
├── docs/                # Public documentation
├── scripts/             # Build and utility scripts
└── [Other project files]
```

## Directory Details

### `.vtask/` Directory
The `.vtask` directory contains all project management and metadata files. This is the core of our task management system.

#### `docs/`
- Internal project documentation
- Development guides
- Architecture documents
- Process documentation

#### `logs/`
- Development logs
- Runtime logs
- Error logs
- Performance logs
- Note: Actual log files are git-ignored, but directory structure is preserved

#### `tasks/`
- Individual task files
- Task hierarchies
- Task metadata
- Progress tracking

#### `templates/`
- Template files for various project artifacts
- Validation schemas
- Example implementations

##### `examples/`
- Example files showing how to use templates
- Reference implementations
- Best practice demonstrations

##### `schemas/`
- JSON Schema files for validation
- Template structure definitions
- Metadata specifications

### Source Code Organization

#### `src/`
- Application source code
- Components
- Utilities
- Type definitions

#### `docs/`
- Public documentation
- API documentation
- User guides
- Getting started guides

#### `scripts/`
- Build scripts
- Development utilities
- Automation tools
- CI/CD scripts

## File Naming Conventions

1. **Task Files**:
   - Format: `task-{number}.md` or `task-{number}-{sub-number}.md`
   - Example: `task-001.md`, `task-001-1.md`

2. **Template Files**:
   - Format: `{type}.template.md`
   - Example: `task.template.md`, `board.template.md`

3. **Schema Files**:
   - Format: `{type}.schema.json`
   - Example: `task.schema.json`, `board.schema.json`

4. **Log Files**:
   - Format: `{type}-{date}.log`
   - Example: `development-2024-03-21.log`

## Version Control

### `.gitignore` Rules
- Ignores runtime-generated files
- Preserves directory structure
- Excludes sensitive information
- Maintains clean repository

### `.gitkeep` Files
Used to preserve empty directory structure in:
- `.vtask/logs/`
- `.vtask/templates/examples/`
- `.vtask/templates/schemas/`

## Best Practices

1. **Directory Organization**:
   - Keep related files together
   - Maintain clear separation of concerns
   - Use appropriate subdirectories for organization

2. **File Management**:
   - Follow naming conventions strictly
   - Place files in appropriate directories
   - Maintain directory structure

3. **Documentation**:
   - Document new directories in this file
   - Explain significant structure changes
   - Keep directory listings updated

## Adding New Directories

When adding new directories:
1. Update this documentation
2. Add appropriate `.gitkeep` files if needed
3. Update `.gitignore` if necessary
4. Document the purpose and conventions

## Directory Structure Validation

The project structure can be validated using:
1. Schema validations for content
2. Directory structure checks
3. File naming convention validations

## Notes

- Directory structure is enforced by tooling
- Empty directories are preserved using `.gitkeep`
- Structure supports AI-assisted task management
- Follows standard project organization practices 