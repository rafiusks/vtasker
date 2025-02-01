# AI Agent Guide for vTasker Templates

This guide helps AI agents understand how to interpret and use the metadata and instructions in vTasker templates.

## General Principles

1. **Context Awareness**
   - Always check AI metadata before processing any file
   - Consider the relationships between tasks, boards, and documentation
   - Respect automation levels and preferences
   - Follow specified constraints and requirements

2. **Progressive Enhancement**
   - Start with minimal automation when uncertain
   - Increase automation level based on success metrics
   - Learn from usage patterns and feedback
   - Adapt to project-specific patterns

## Task Template Interpretation

### AI Metadata Fields
- **Complexity**: Influences depth of analysis and solution approach
  - `low`: Minimal context needed, straightforward solutions
  - `medium`: Balance between efficiency and thoroughness
  - `high`: Thorough analysis, careful consideration of implications

- **Required Skills**: Determines expertise areas needed
  - Match against available tools and capabilities
  - Consider skill combinations for optimal solutions
  - Flag if missing critical skills

- **Context Needed**:
  - `codebase`: Focus on code analysis and implementation
  - `domain`: Focus on business logic and requirements
  - `both`: Comprehensive analysis needed
  - `minimal`: Can proceed with limited context

- **Task Nature**:
  - `algorithmic`: Focus on optimization and correctness
  - `creative`: Allow for multiple solutions, prioritize innovation
  - `maintenance`: Focus on stability and backwards compatibility
  - `research`: Prioritize exploration and documentation

### AI Instructions
- **Preferred Approach**: Primary strategy to follow
  - Treat as strong recommendation unless conflicts with constraints
  - Document any deviations

- **Constraints**: Hard requirements that must be met
  - Validate solutions against each constraint
  - Flag violations immediately

- **Special Considerations**: Soft requirements
  - Factor into decision-making
  - Document how they influenced choices

- **Success Metrics**: Validation criteria
  - Use for continuous evaluation
  - Guide progressive improvements

### AI Progress Tracking
- Use for maintaining context between sessions
- Update after significant actions
- Include rationale for decisions
- Document blockers and insights

## Board Template Interpretation

### AI Configuration
- **Automation Level**: Determines AI intervention scope
  - `minimal`: Request human approval for most actions
  - `moderate`: Automate routine tasks, seek approval for significant changes
  - `full`: Autonomous operation within defined constraints

- **Task Creation/Assignment/Priority**: Guides proactive actions
  - Balance between automation preferences and board health
  - Consider WIP limits and team capacity

### Automation Rules
- Treat as event-driven triggers
- Validate conditions before acting
- Maintain audit trail of automated actions
- Consider rule interactions and conflicts

### AI Workflow Preferences
- Use to tune analysis frequency and depth
- Adjust resource allocation based on preferences
- Follow specified reporting cadence
- Respect skill matching settings

### AI Insights
- Maintain historical context
- Use for trend analysis and predictions
- Proactively identify issues
- Suggest improvements based on patterns

## Documentation Template Interpretation

### AI Metadata
- **Document Purpose**: Guides content approach
  - `implementation`: Focus on code examples and technical details
  - `explanation`: Focus on clarity and understanding
  - `reference`: Focus on accuracy and completeness
  - `tutorial`: Focus on step-by-step guidance

- **Update Frequency**: Determines maintenance approach
  - `static`: Minimal updates, focus on accuracy
  - `occasional`: Regular validation cycles
  - `frequent`: Active monitoring and updates

### Context Links
- Use for dependency analysis
- Maintain bidirectional references
- Track code-doc alignment
- Update related documents

### AI Maintenance Instructions
- Follow update triggers precisely
- Apply validation rules consistently
- Respect auto-update settings
- Document maintenance actions

### AI Analysis
- Maintain quality metrics
- Track usage patterns
- Identify improvement opportunities
- Guide content evolution

## Best Practices

1. **Version Control**
   - Track changes to AI-related fields
   - Document reasoning for changes
   - Maintain history of automated actions

2. **Error Handling**
   - Gracefully handle missing or invalid metadata
   - Report inconsistencies
   - Suggest corrections

3. **Communication**
   - Use comment sections effectively
   - Maintain clear action logs
   - Provide context for decisions

4. **Learning**
   - Track successful patterns
   - Learn from failures
   - Share insights across tasks
   - Adapt to project evolution

## Common Scenarios

1. **Task Creation**
```markdown
Steps:
1. Check board automation level
2. Analyze required context
3. Set appropriate metadata
4. Apply templates
5. Update board
```

2. **Documentation Updates**
```markdown
Steps:
1. Validate update triggers
2. Check dependencies
3. Apply changes
4. Run validations
5. Update metrics
```

3. **Board Management**
```markdown
Steps:
1. Monitor health metrics
2. Apply automation rules
3. Update insights
4. Suggest optimizations
```

## Error Recovery

1. **Invalid Metadata**
   - Log issue
   - Use safe defaults
   - Request clarification
   - Continue with reduced automation

2. **Rule Conflicts**
   - Apply precedence rules
   - Document conflict
   - Seek resolution
   - Use conservative approach

3. **Missing Context**
   - Identify gaps
   - Request information
   - Proceed with available data
   - Flag limitations

## Continuous Improvement

1. **Pattern Recognition**
   - Track successful approaches
   - Identify common issues
   - Suggest template improvements
   - Share learnings

2. **Metric Analysis**
   - Monitor success rates
   - Track automation effectiveness
   - Identify bottlenecks
   - Suggest optimizations

3. **Template Evolution**
   - Suggest metadata improvements
   - Identify missing fields
   - Propose new automation rules
   - Update validation rules 