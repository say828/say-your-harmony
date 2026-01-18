# Meta-Clear Skill

## What It Does

**Safely clears meta-analysis artifacts** while preserving configuration.

Removes:
- Session meta-analysis files
- Quick meta snapshots
- Pattern analysis files
- Phase-specific meta files

Preserves:
- Configuration files (config.json)
- System settings

**Philosophy**: **"Clean slate for fresh insights - preserve what matters."**

---

## When to Use

- After **major project milestones** (clean start for next phase)
- When **meta directory becomes cluttered** (hundreds of session files)
- Before **switching projects** (keep meta focused)
- During **workspace cleanup** (housekeeping)

**Never** for:
- Active analysis sessions
- Before backing up important insights
- When pattern history is needed

---

## How It Changes Behavior

When metaclear is executed:

1. **Preview by default**
   - Lists all files to be deleted
   - Shows file count and total size
   - No deletion without --confirm

2. **Optional backup before deletion**
   - --backup flag creates timestamped copy
   - Backup location: ~/.claude/meta-backup/YYYY-MM-DD-HH-MM/
   - Preserves deleted data for recovery

3. **Safe deletion with --confirm**
   - Only executes after user confirmation
   - Reports deletion results
   - Preserves config.json automatically

---

## Activation

### Preview (Default)
```bash
/metaclear
```
Shows what would be deleted without actually deleting.

### Backup and Clear
```bash
/metaclear --backup --confirm
```
Creates backup before deletion.

### Clear Without Backup
```bash
/metaclear --confirm
```
Immediate deletion (use with caution).

### Help
```bash
/metaclear --help
```

---

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--confirm` | `-c` | Actually execute deletion (preview by default) |
| `--backup` | `-b` | Create timestamped backup before deletion |
| `--help` | `-h` | Show usage information |

---

## Files Cleared

### Meta Analysis Files
```
~/.claude/meta/session-*.md
~/.claude/meta/PATTERNS.md
~/.claude/meta/patterns-*.json
```

### Quick Meta Snapshots
```
~/.claude/meta/quickmeta/*
```

### Phase-Specific Meta Files
```
~/.claude/meta/planning/*
~/.claude/meta/design/*
~/.claude/meta/implementation/*
~/.claude/meta/operation/*
```

### Total Files Affected
Typically 50-500 files depending on usage history.

---

## Files Preserved

### Configuration
```
~/.claude/meta/config.json
```

This file contains your meta-analysis settings and preferences.

---

## Output Examples

### Preview Mode (Default)
```
Meta-Clear Preview
==================

Files to be deleted:
  - 47 session meta-analysis files
  - 12 quick meta snapshots
  - 3 pattern analysis files
  - 156 phase-specific files

Total: 218 files (~3.2 MB)

Preserved:
  ✓ config.json

To execute deletion, run:
  /metaclear --confirm

To backup before deletion, run:
  /metaclear --backup --confirm
```

### With Backup
```
Meta-Clear with Backup
======================

Step 1: Creating backup...
  ✓ Backup created: ~/.claude/meta-backup/2026-01-18-14-30/
  ✓ 218 files copied (3.2 MB)

Step 2: Clearing meta files...
  ✓ Deleted 47 session files
  ✓ Deleted 12 quickmeta files
  ✓ Deleted 3 pattern files
  ✓ Deleted 156 phase files

Step 3: Results
  ✓ Total deleted: 218 files (3.2 MB)
  ✓ Preserved: config.json
  ✓ Backup available: ~/.claude/meta-backup/2026-01-18-14-30/

Meta directory cleared successfully.
```

### Without Backup
```
Meta-Clear
==========

Clearing meta files...
  ✓ Deleted 47 session files
  ✓ Deleted 12 quickmeta files
  ✓ Deleted 3 pattern files
  ✓ Deleted 156 phase files

Results:
  ✓ Total deleted: 218 files (3.2 MB)
  ✓ Preserved: config.json

Meta directory cleared successfully.
```

---

## Safety Features

### 1. Preview First
Default behavior shows what will be deleted without actually deleting.

### 2. Backup Option
--backup flag creates complete copy before deletion.

### 3. Config Preservation
config.json is automatically preserved in all operations.

### 4. Explicit Confirmation
--confirm flag required for actual deletion.

### 5. Detailed Reporting
Shows exactly what was deleted and what was preserved.

---

## Backup Management

### Backup Location
```
~/.claude/meta-backup/YYYY-MM-DD-HH-MM/
```

### Backup Contents
Complete copy of all deleted files, maintaining directory structure.

### Backup Retention
Backups are NOT automatically deleted. Manual cleanup recommended:
```bash
# List backups
ls -lh ~/.claude/meta-backup/

# Remove old backups manually
rm -rf ~/.claude/meta-backup/2026-01-10-*/
```

---

## Use Cases

### Case 1: Clean Start for New Project
```bash
# Backup current meta, then clear
/metaclear --backup --confirm
```

### Case 2: Quick Check Before Cleanup
```bash
# Preview what would be deleted
/metaclear

# If looks good, execute
/metaclear --confirm
```

### Case 3: Periodic Housekeeping
```bash
# Every month, backup and clear old meta
/metaclear --backup --confirm
```

---

## Integration with Meta Workflow

Meta-clear complements the meta skill:

```
Meta Skill                  Meta-Clear Skill
─────────                  ────────────────
Generate meta-analysis  →  Accumulates files over time
Session insights        →  Workspace becomes cluttered
Pattern extraction      →  Clean slate needed
                        →  /metaclear --backup --confirm
                        →  Fresh start with preserved config
```

---

## Warning Scenarios

### ⚠️ Warning 1: Active Analysis
```
If you're in the middle of generating meta-analysis:
→ Finish or save analysis first
→ Then run metaclear
```

### ⚠️ Warning 2: No Backup
```
Without --backup, deleted files are gone permanently:
→ Use --backup for important sessions
→ Or manually copy critical files first
```

### ⚠️ Warning 3: Pattern History
```
Clearing patterns-*.json removes learned patterns:
→ Consider if pattern history is valuable
→ Backup before clearing if unsure
```

---

## Recovery

### If Backup Was Created
```bash
# Restore from backup
cp -r ~/.claude/meta-backup/2026-01-18-14-30/* ~/.claude/meta/
```

### If No Backup
```
Files are permanently deleted.
Cannot be recovered without system-level backup (Time Machine, etc.)
```

---

## Success Criteria

When metaclear succeeds:
- ✅ **Safe**: Preview shown by default
- ✅ **Explicit**: Requires --confirm for deletion
- ✅ **Backup**: Optional --backup creates timestamped copy
- ✅ **Preserved**: config.json always kept
- ✅ **Reported**: Detailed results shown

---

## Common Pitfalls

### ❌ Pitfall 1: No Confirmation
```
Wrong: /metaclear (just shows preview)
Right: /metaclear --confirm (actually deletes)
```

### ❌ Pitfall 2: Forgetting Backup
```
Wrong: /metaclear --confirm (no backup)
Right: /metaclear --backup --confirm (safe deletion)
```

### ❌ Pitfall 3: Not Checking Preview
```
Wrong: Immediate --confirm without seeing preview
Right: Run /metaclear first, review, then add --confirm
```

---

## Tips

1. **Preview first**: Always run without flags to see what will be deleted
2. **Backup important sessions**: Use --backup when in doubt
3. **Periodic cleanup**: Run monthly to keep meta directory manageable
4. **Check backup size**: Backups accumulate; clean old ones manually
5. **Preserve patterns**: If you rely on pattern history, backup first
