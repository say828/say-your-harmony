# Say-Your-Harmony Development Guidelines

## Version Management

### Critical: Synchronized Version Updates

When updating the version number, **ALL** of the following files MUST be updated simultaneously:

#### Required Version Files
1. **`package.json`** (line 3)
   - Main npm package version
   - Updated via `npm version` command

2. **`.claude-plugin/plugin.json`** (line 3)
   - Claude Code plugin version
   - Must match package.json exactly

3. **`README.md`**
   - Installation instructions
   - Version badges
   - Example code snippets with version numbers

4. **`CHANGELOG.md`**
   - Add new version entry with date
   - Document all changes (Added/Changed/Fixed/Removed)
   - Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format

### Version Update Checklist

Before releasing a new version:

- [ ] Update `package.json` version
- [ ] Update `.claude-plugin/plugin.json` version
- [ ] Update `README.md` references
- [ ] Add entry to `CHANGELOG.md` with:
  - [ ] Version number and date
  - [ ] Added features
  - [ ] Changed functionality
  - [ ] Fixed bugs
  - [ ] Removed features (if any)
- [ ] Run `npm run build` to verify build
- [ ] Run `npm run test:run` to verify tests
- [ ] Commit with message: `chore: release vX.Y.Z`
- [ ] Create git tag: `git tag vX.Y.Z`
- [ ] Push with tags: `git push origin main --tags`

### Version Numbering (Semantic Versioning)

Follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─── Bug fixes
  │     └───────── New features (backwards compatible)
  └─────────────── Breaking changes
```

Examples:
- `1.0.0` → `1.0.1`: Bug fix only
- `1.0.0` → `1.1.0`: New feature added
- `1.0.0` → `2.0.0`: Breaking API change

### Automated Version Update Script

```bash
#!/bin/bash
# scripts/update-version.sh

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/update-version.sh <version>"
  exit 1
fi

echo "Updating to version $VERSION..."

# Update package.json
npm version $VERSION --no-git-tag-version

# Update plugin.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" .claude-plugin/plugin.json

echo "✓ Version updated to $VERSION in all files"
echo "⚠ Don't forget to:"
echo "  1. Update CHANGELOG.md"
echo "  2. Update README.md"
echo "  3. Run npm run build && npm run test:run"
echo "  4. Commit: git commit -am 'chore: release v$VERSION'"
echo "  5. Tag: git tag v$VERSION"
echo "  6. Push: git push origin main --tags"
```

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `hotfix/*`: Emergency fixes

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(metaview): add meta-analysis dashboard command
fix(builder): resolve parallel execution race condition
docs(readme): update installation instructions
chore: release v1.1.2
```

## Testing Guidelines

### Before Every Commit
```bash
npm run build      # Verify compilation
npm run test:run   # Run all tests
npm run lint       # Check code style
```

### Before Every Release
```bash
npm run test:coverage  # Ensure coverage >80%
npm run build          # Production build
npm link              # Test local installation
```

## Documentation Guidelines

### Required Documentation Updates

When adding new features:
1. Update README.md with usage examples
2. Add JSDoc comments to public APIs
3. Update CHANGELOG.md
4. Add unit tests with >80% coverage
5. Update ~/.claude/CLAUDE.md if adding slash commands

### Slash Command Documentation Format

```markdown
| Command | Description |
|---------|-------------|
| `/command <arg>` | Brief description of what it does |
```

## Meta-Analysis Storage

### Global Storage Location
All meta-analyses are stored in:
```
~/.say-your-harmony/meta/
```

### Storage Structure
```
~/.say-your-harmony/
├── meta/
│   ├── meta-analysis-YYYY-MM-DD-HH-mm-ss.json
│   └── meta-analysis-YYYY-MM-DD-HH-mm-ss.json
└── config.json
```

## Publishing Checklist

Before publishing to npm:

- [ ] All tests passing
- [ ] Version updated in ALL files
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] Build succeeds: `npm run build`
- [ ] Local installation works: `npm link`
- [ ] Git tag created: `git tag vX.Y.Z`
- [ ] Changes pushed: `git push origin main --tags`
- [ ] npm publish: `npm publish`

## Support

- Issues: https://github.com/say828/say-your-harmony/issues
- Discussions: https://github.com/say828/say-your-harmony/discussions
