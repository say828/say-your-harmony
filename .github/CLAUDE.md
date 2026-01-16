# Claude AI Instructions for say-your-harmony

This file provides context for Claude when working on this repository via GitHub Actions.

## Repository Overview

say-your-harmony is a Claude Code plugin that provides multi-agent orchestration capabilities.

### Key Features
- **19 specialized agents** with intelligent model routing (Haiku/Sonnet/Opus tiers)
- **11 slash commands** including /ultrawork, /chillwork, /deepinit, /prometheus, /ralph-loop
- **Smart delegation** - automatically routes tasks to appropriate specialist agents
- **Background execution** - runs long-running tasks asynchronously
- **Cost optimization** - chillwork mode prefers cheaper model tiers

### Installation
```bash
/plugin marketplace add Yeachan-Heo/say-your-harmony
```

## Code Structure

```
.claude-plugin/          # Plugin metadata
  plugin.json            # Main plugin config
  marketplace.json       # Marketplace registration
agents/                  # Agent definitions (YAML)
skills/                  # Skill definitions (Markdown)
commands/                # Slash command definitions
hooks/                   # Hook scripts
src/                     # Source code (if any)
tests/                   # Test files
```

## When Responding to Issues

### Installation Issues
- Recommend running `/doctor` to diagnose problems
- Check if user installed via correct method: `/plugin marketplace add Yeachan-Heo/say-your-harmony`
- Common issues: outdated Claude Code version, missing dependencies

### Bug Reports
- Ask for Claude Code version if not provided
- Request reproduction steps
- Check if issue exists in `agents/` or `skills/` definitions

### Feature Requests
- Acknowledge the request
- Consider if it fits the plugin's philosophy (intelligent delegation, persistence)
- Label appropriately

## When Reviewing PRs

### Agent Definitions
- Verify YAML syntax is correct
- Check that `subagent_type` matches the file name
- Ensure model tier is appropriate (haiku for simple, sonnet for medium, opus for complex)
- Verify description matches the agent's purpose

### Skill Definitions
- Check Markdown formatting
- Verify the skill follows existing patterns
- Ensure instructions are clear and complete

### Code Quality
- Follow existing code patterns
- Include tests for new functionality
- Update version numbers if adding features

## Agent Tiers

| Tier | Model | Use For |
|------|-------|---------|
| LOW | Haiku | Simple lookups, fast searches |
| MEDIUM | Sonnet | Standard implementation work |
| HIGH | Opus | Complex reasoning, architecture |

## Common Labels

- `bug` - Something isn't working
- `enhancement` - Feature request
- `question` - User needs help
- `documentation` - Docs improvement
- `installation` - Setup/install issues
- `agents` - Related to agent definitions
- `stale` - No recent activity
- `pinned` - Keep open, don't auto-close
