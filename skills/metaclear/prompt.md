# Meta-Clear Execution Prompt

You are executing the **Meta-Clear** skill for say-your-harmony.

## Objective

Safely clear meta-analysis artifacts while preserving configuration, with optional backup.

---

## Execution Steps

### Step 1: Parse Options

Extract options from user command:
- `--confirm` or `-c`: Execute deletion (default: preview only)
- `--backup` or `-b`: Create backup before deletion
- `--help` or `-h`: Show help and exit

If `--help` provided:
- Display usage information from SKILL.md
- Exit without further processing

---

### Step 2: Identify Files to Clear

Scan the following locations:

#### Session Meta Files
```bash
~/.claude/meta/session-*.md
```

#### Pattern Files
```bash
~/.claude/meta/PATTERNS.md
~/.claude/meta/patterns-*.json
```

#### Quick Meta Snapshots
```bash
~/.claude/meta/quickmeta/*
```

#### Phase-Specific Meta Files
```bash
~/.claude/meta/planning/*
~/.claude/meta/design/*
~/.claude/meta/implementation/*
~/.claude/meta/operation/*
```

**Important**: Use absolute path `/Users/say/.claude/meta/` instead of `~/.claude/meta/`

**Exclude**: Always preserve `~/.claude/meta/config.json`

Generate summary:
- Count files per category
- Calculate total file count
- Calculate total size (MB)

---

### Step 3: Preview Mode (Default)

If `--confirm` NOT provided:

Display preview:
```
Meta-Clear Preview
==================

Files to be deleted:
  - X session meta-analysis files
  - Y quick meta snapshots
  - Z pattern analysis files
  - W phase-specific files

Total: N files (~M MB)

Preserved:
  ✓ config.json

To execute deletion, run:
  /metaclear --confirm

To backup before deletion, run:
  /metaclear --backup --confirm
```

**Exit** after showing preview.

---

### Step 4: Backup (If --backup Provided)

If `--backup` flag provided and `--confirm` provided:

1. Generate timestamp: `YYYY-MM-DD-HH-MM`
2. Create backup directory:
   ```bash
   mkdir -p ~/.claude/meta-backup/{timestamp}/
   ```

3. Copy all files to be deleted:
   ```bash
   # Session files
   cp ~/.claude/meta/session-*.md ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true

   # Pattern files
   cp ~/.claude/meta/PATTERNS.md ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true
   cp ~/.claude/meta/patterns-*.json ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true

   # Quick meta (preserve directory structure)
   cp -r ~/.claude/meta/quickmeta ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true

   # Phase files (preserve directory structure)
   cp -r ~/.claude/meta/planning ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true
   cp -r ~/.claude/meta/design ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true
   cp -r ~/.claude/meta/implementation ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true
   cp -r ~/.claude/meta/operation ~/.claude/meta-backup/{timestamp}/ 2>/dev/null || true
   ```

4. Report backup:
   ```
   Step 1: Creating backup...
     ✓ Backup created: ~/.claude/meta-backup/{timestamp}/
     ✓ N files copied (M MB)
   ```

---

### Step 5: Execute Deletion (If --confirm Provided)

If `--confirm` flag provided:

1. Delete session files:
   ```bash
   rm -f ~/.claude/meta/session-*.md 2>/dev/null || true
   ```

2. Delete pattern files:
   ```bash
   rm -f ~/.claude/meta/PATTERNS.md 2>/dev/null || true
   rm -f ~/.claude/meta/patterns-*.json 2>/dev/null || true
   ```

3. Delete quick meta directory:
   ```bash
   rm -rf ~/.claude/meta/quickmeta/* 2>/dev/null || true
   ```

4. Delete phase directories:
   ```bash
   rm -rf ~/.claude/meta/planning/* 2>/dev/null || true
   rm -rf ~/.claude/meta/design/* 2>/dev/null || true
   rm -rf ~/.claude/meta/implementation/* 2>/dev/null || true
   rm -rf ~/.claude/meta/operation/* 2>/dev/null || true
   ```

**Critical**: Never delete `~/.claude/meta/config.json`

---

### Step 6: Report Results

#### With Backup
```
Meta-Clear with Backup
======================

Step 1: Creating backup...
  ✓ Backup created: ~/.claude/meta-backup/{timestamp}/
  ✓ N files copied (M MB)

Step 2: Clearing meta files...
  ✓ Deleted X session files
  ✓ Deleted Y quickmeta files
  ✓ Deleted Z pattern files
  ✓ Deleted W phase files

Step 3: Results
  ✓ Total deleted: N files (M MB)
  ✓ Preserved: config.json
  ✓ Backup available: ~/.claude/meta-backup/{timestamp}/

Meta directory cleared successfully.
```

#### Without Backup
```
Meta-Clear
==========

Clearing meta files...
  ✓ Deleted X session files
  ✓ Deleted Y quickmeta files
  ✓ Deleted Z pattern files
  ✓ Deleted W phase files

Results:
  ✓ Total deleted: N files (M MB)
  ✓ Preserved: config.json

Meta directory cleared successfully.
```

---

## Error Handling

### Directory Not Found
If `~/.claude/meta/` doesn't exist:
```
Error: Meta directory not found at ~/.claude/meta/
No action taken.
```

### No Files to Delete
If no matching files found:
```
Meta-Clear
==========

No meta files found to delete.
Meta directory is already clean.
```

### Backup Failed
If backup fails (disk space, permissions):
```
Error: Backup failed - {error message}
Deletion aborted for safety.
```

### Deletion Failed
If deletion partially fails:
```
Warning: Some files could not be deleted:
  - {file1}: {error}
  - {file2}: {error}

Deleted: X/N files
Please check permissions and try again.
```

---

## Safety Checks

Before deletion:
1. ✅ Verify `--confirm` flag present (or just preview)
2. ✅ Check `config.json` is NOT in deletion list
3. ✅ If `--backup`, verify backup completed successfully
4. ✅ Use `-f` flag to avoid interactive prompts
5. ✅ Use `|| true` to continue on errors

---

## Implementation Notes

### Use Absolute Paths
Always use `/Users/say/.claude/meta/` instead of `~/.claude/meta/` in bash commands.

### Count Files Accurately
Use commands like:
```bash
# Count session files
ls -1 ~/.claude/meta/session-*.md 2>/dev/null | wc -l

# Calculate total size
du -sh ~/.claude/meta/session-*.md ~/.claude/meta/quickmeta 2>/dev/null | awk '{sum+=$1} END {print sum}'
```

### Handle Missing Files Gracefully
Use `2>/dev/null || true` to suppress errors for missing files.

### Preserve Directory Structure in Backup
Use `cp -r` for directories to maintain structure.

### Timestamp Format
Use format: `YYYY-MM-DD-HH-MM` (e.g., `2026-01-18-14-30`)

---

## Testing Checklist

Before deploying:
- [ ] Preview mode shows files without deleting
- [ ] `--confirm` actually deletes files
- [ ] `--backup` creates timestamped backup
- [ ] `config.json` is never deleted
- [ ] File counts are accurate
- [ ] Size calculations are correct
- [ ] Error messages are helpful
- [ ] Works when some directories are empty
- [ ] Works when meta directory is already clean

---

## Expected Behavior Summary

| Command | Behavior |
|---------|----------|
| `/metaclear` | Preview only, no deletion |
| `/metaclear --confirm` | Delete without backup |
| `/metaclear --backup --confirm` | Backup then delete |
| `/metaclear --help` | Show help, no deletion |

---

## Success Criteria

Execution is successful when:
- ✅ Preview accurately shows what will be deleted
- ✅ Backup (if requested) completes before deletion
- ✅ Only specified files are deleted
- ✅ config.json is preserved
- ✅ Clear reporting of all actions
- ✅ Graceful handling of missing files/directories
