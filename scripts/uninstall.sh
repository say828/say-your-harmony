#!/bin/bash
# Say-Your-Harmony Uninstaller
# Removes all Say-Your-Harmony installed files and configurations

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Say-Your-Harmony Uninstaller${NC}"
echo ""

# Claude Code config directory (always ~/.claude)
CLAUDE_CONFIG_DIR="$HOME/.claude"

echo "This will remove ALL Say-Your-Harmony components from:"
echo "  $CLAUDE_CONFIG_DIR"
echo ""
echo "Components to be removed:"
echo "  - 8 Agents (harmony, planner, architect, builder, operator, explorer, documenter, meta-analyzer)"
echo "  - 7 Commands (harmony, plan, design, build, operate, meta, ultrathink)"
echo "  - 4 Skills (ultrathink, parallel, meta, phase)"
echo "  - Hooks (keyword-detector)"
echo "  - Version file"
echo ""
if [ -t 0 ]; then
    read -p "Continue? (y/N) " -n 1 -r
    echo
else
    if [ -c /dev/tty ]; then
        echo -n "Continue? (y/N) " >&2
        read -n 1 -r < /dev/tty
        echo
    else
        echo "Non-interactive mode detected. Uninstallation cancelled."
        exit 1
    fi
fi

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Remove agents
echo -e "${BLUE}Removing agents...${NC}"
rm -f "$CLAUDE_CONFIG_DIR/agents/harmony.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/planner.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/architect.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/builder.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/operator.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/explorer.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/documenter.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/meta-analyzer.md"
echo -e "${GREEN}✓ Removed 8 agents${NC}"

# Remove commands
echo -e "${BLUE}Removing commands...${NC}"
rm -f "$CLAUDE_CONFIG_DIR/commands/harmony.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/plan.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/design.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/build.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/operate.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/meta.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/ultrathink.md"
echo -e "${GREEN}✓ Removed 7 commands${NC}"

# Remove skills
echo -e "${BLUE}Removing skills...${NC}"
rm -rf "$CLAUDE_CONFIG_DIR/skills/ultrathink"
rm -rf "$CLAUDE_CONFIG_DIR/skills/parallel"
rm -rf "$CLAUDE_CONFIG_DIR/skills/meta"
rm -rf "$CLAUDE_CONFIG_DIR/skills/phase"
echo -e "${GREEN}✓ Removed 4 skills${NC}"

# Remove hooks
echo -e "${BLUE}Removing hooks...${NC}"
rm -f "$CLAUDE_CONFIG_DIR/hooks/keyword-detector.sh"
echo -e "${GREEN}✓ Removed hooks${NC}"

# Remove version file
echo -e "${BLUE}Removing version file...${NC}"
rm -f "$CLAUDE_CONFIG_DIR/.harmony-version.json"
echo -e "${GREEN}✓ Removed version file${NC}"

echo ""
echo -e "${GREEN}Uninstallation complete!${NC}"
echo ""
echo -e "${YELLOW}Items NOT removed (manual cleanup if desired):${NC}"
echo "  - CLAUDE.md: rm $CLAUDE_CONFIG_DIR/CLAUDE.md"
echo ""
echo "To verify complete removal, check:"
echo "  ls -la $CLAUDE_CONFIG_DIR/"
echo ""
