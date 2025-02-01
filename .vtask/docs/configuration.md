# vTasker Configuration Guide

This document explains the configuration system of vTasker, including all available settings and their usage.

## Overview

The configuration system uses YAML format and is validated against a JSON schema. The main configuration file is located at `.vtask/config.yaml`.

## Configuration Sections

### Project Settings
```yaml
project:
  name: vTasker                                    # Project name
  version: 0.1.0                                   # Project version
  description: AI-powered task management system   # Brief description
  repository: https://github.com/user/vTasker      # Repository URL
```

### Task Management
```yaml
tasks:
  directory: .vtask/tasks                # Where task files are stored
  naming:
    pattern: task-{number}              # How tasks are numbered
    counter_digits: 3                   # Number of digits in task ID
    subtask_separator: "-"              # Separator for subtask numbers
  templates:
    directory: .vtask/templates         # Template file location
    default: task.template.md           # Default task template
  statuses:                            # Valid task statuses
    - backlog
    - in-progress
    - review
    - done
```

### Board Management
```yaml
boards:
  directory: .vtask/boards             # Where board files are stored
  default_settings:
    wip_limits:                        # Work in Progress limits
      in_progress: 3                   # Max tasks in progress
      review: 2                        # Max tasks in review
    auto_archive:
      enabled: true                    # Auto-archive completed tasks
      after_days: 30                   # Days before archiving
```

### AI Settings
```yaml
ai:
  default_settings:
    automation_level: moderate         # AI automation level
    task_creation: ai-assisted        # How AI helps with task creation
    task_assignment: ai-suggested     # How AI helps with assignment
    analysis_frequency: on-change     # When AI analyzes the project
```

## Configuration Details

### Task Naming Pattern
- Uses `{number}` placeholder for task number
- Example: `task-001`, `task-001-1`
- Counter digits determine padding (e.g., 3 digits: 001, 002)

### Status Workflow
1. `backlog`: New tasks start here
2. `in-progress`: Tasks being worked on
3. `review`: Tasks ready for review
4. `done`: Completed tasks

### WIP Limits
- Prevents overloading team members
- Helps maintain focus
- Configurable per board section

### AI Automation Levels
- `minimal`: AI provides basic assistance
- `moderate`: AI actively suggests and helps
- `full`: AI can take autonomous actions

### Analysis Frequency
- `on-change`: Analyze when files change
- `hourly`: Regular hourly analysis
- `daily`: Daily project analysis

## Validation

The configuration is validated using JSON Schema located at `.vtask/templates/schemas/config.schema.json`.

### Validation Rules
1. All required fields must be present
2. Values must match specified types
3. Enums must use predefined values
4. Numbers must be within valid ranges

## Modifying Configuration

When modifying the configuration:
1. Update the YAML file
2. Run validation to ensure correctness
3. Restart services if required
4. Update documentation if needed

## Best Practices

1. **Version Control**
   - Keep configuration in version control
   - Document significant changes
   - Use comments for clarity

2. **AI Settings**
   - Start with moderate automation
   - Adjust based on team comfort
   - Monitor AI effectiveness

3. **WIP Limits**
   - Set based on team capacity
   - Adjust as needed
   - Monitor for bottlenecks

4. **Task Management**
   - Use consistent naming
   - Maintain status workflow
   - Regular archiving

## Troubleshooting

Common issues and solutions:

1. **Invalid Configuration**
   - Check schema validation
   - Verify YAML syntax
   - Ensure all required fields

2. **WIP Limit Issues**
   - Review team capacity
   - Check task distribution
   - Adjust limits if needed

3. **AI Integration**
   - Verify automation settings
   - Check analysis frequency
   - Monitor AI performance

## Notes

- Configuration changes take effect immediately
- Some settings may require service restart
- AI settings can be adjusted per project needs
- Regular review of settings recommended 