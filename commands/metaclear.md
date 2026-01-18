---
description: Clear meta-analysis artifacts while preserving configuration
model: sonnet
---

# /metaclear - Clear Meta-Analysis Files

Safely clear meta-analysis artifacts while preserving configuration.

---

## Usage

### Preview (Default)
```bash
/metaclear
```
Shows what would be deleted without actually deleting.

### Execute Deletion
```bash
/metaclear --confirm
```
Actually deletes the files.

### With Backup
```bash
/metaclear --backup --confirm
```
Creates timestamped backup before deletion.

### Help
```bash
/metaclear --help
```

---

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--confirm` | `-c` | Execute deletion (preview by default) |
| `--backup` | `-b` | Create backup before deletion |
| `--help` | `-h` | Show usage information |

---

## What Gets Cleared

### Session Meta Files
```
~/.claude/meta/session-*.md
~/.claude/meta/PATTERNS.md
~/.claude/meta/patterns-*.json
```

### Quick Meta Snapshots
```
~/.claude/meta/quickmeta/*
```

### Phase-Specific Meta
```
~/.claude/meta/planning/*
~/.claude/meta/design/*
~/.claude/meta/implementation/*
~/.claude/meta/operation/*
```

### Typical Volume
50-500 files, depending on usage history.

---

## What Gets Preserved

### Configuration
```
~/.claude/meta/config.json
```

Always preserved in all operations.

---

## When to Use

### ✅ Use /metaclear When:
- After major project milestones (fresh start)
- Meta directory becomes cluttered (hundreds of files)
- Switching projects (focused workspace)
- Periodic housekeeping (monthly cleanup)

### ❌ Don't Use For:
- Active analysis sessions (finish first)
- Before backing up important insights
- When pattern history is still needed

---

## Output Examples

### Preview Mode
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

---

## Safety Features

### 1. Preview First
Default behavior shows what will be deleted without actually deleting.

### 2. Backup Option
`--backup` creates complete timestamped copy before deletion.

### 3. Config Preservation
`config.json` is automatically preserved in all operations.

### 4. Explicit Confirmation
`--confirm` flag required for actual deletion.

### 5. Detailed Reporting
Shows exactly what was deleted and what was preserved.

---

## Backup Management

### Backup Location
```
~/.claude/meta-backup/YYYY-MM-DD-HH-MM/
```

### Backup Contents
Complete copy of all deleted files with directory structure preserved.

### Manual Cleanup
Backups are NOT automatically deleted:
```bash
# List backups
ls -lh ~/.claude/meta-backup/

# Remove old backups
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
# Monthly: backup and clear old meta
/metaclear --backup --confirm
```

---

## Recovery

### If Backup Was Created
```bash
# Restore from backup
cp -r ~/.claude/meta-backup/2026-01-18-14-30/* ~/.claude/meta/
```

### If No Backup
Files are permanently deleted. Cannot be recovered without system-level backup (Time Machine, etc.)

---

## Philosophy

> **"Clean slate for fresh insights - preserve what matters."**

From development philosophy:
- Meta-analysis generates valuable data
- But **too much clutter reduces clarity**
- Periodic cleanup maintains **focus**
- Backups ensure **safety**
- Config preservation maintains **continuity**

---

## Integration with Meta Workflow

Metaclear complements the meta skill:

```
Generate Meta (/meta)
     ↓
Accumulate insights
     ↓
Directory becomes cluttered
     ↓
Clean with /metaclear --backup --confirm
     ↓
Fresh start, config preserved
```

---

## Tips

1. **Preview first**: Always run without flags to see what will be deleted
2. **Backup important sessions**: Use --backup when in doubt
3. **Periodic cleanup**: Run monthly to keep meta directory manageable
4. **Check backup size**: Backups accumulate; clean old ones manually
5. **Preserve patterns**: If you rely on pattern history, backup first
6. **Verify before confirm**: Review preview output carefully

---

## Related Commands

- `/meta` - Generate meta-analysis (creates files)
- `/metaclear` - Clear meta-analysis files (this command)
- `/metaview` - View pattern library dashboard
- `/aggregate` - Consolidate meta-analyses into patterns
