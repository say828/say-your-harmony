# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-18

### Added
- **Meta-Learning Framework**: File-based meta-learning for self-improving orchestration
- **Sequential Dependencies**: `sequentialDeps` field tracks tasks that must run sequentially
- **Parallel Successes**: `parallelSuccesses` field records successful concurrent execution patterns
- **Dependency Validator**: `validator.ts` with `validateDependencies()` for runtime checking
- **Research Framework**: Comprehensive hypotheses document (`docs/research/meta-learning-hypotheses.md`)
- **Experimental Design**: 5-step incremental experiment with 15 tasks
- **Quick Reference**: Meta-learning summary (`examples/META_LEARNING_SUMMARY.md`)
- **Conservative Learning**: Safe-by-default approach with incremental optimization

### Changed
- **SemanticPhaseMeta**: Enhanced with dependency tracking (v2 schema)
- **Phase Meta Extractor**: Updated prompt to extract dependencies and parallel successes
- **Background Analysis**: Now extracts actionable dependency information

### Technical Details
- Added `sequentialDeps: string[]` to `SemanticExtractions` (max 5 items, 60 chars each)
- Added `parallelSuccesses: string[]` to `SemanticExtractions` (max 8 items, 60 chars each)
- New file: `src/lib/quickmeta/validator.ts` (~220 LOC)
- New file: `docs/design/sequential-dependencies.md` (design doc)
- Enhanced examples with meta-learning experiments

### Research Impact
- Expected parallelization error reduction: 75% (20% → <5%)
- Expected performance improvement: 2.5x through learned parallelization
- Target venues: ICSE, FSE, ASE (Tier 1 conferences)

## [1.1.2] - 2026-01-18

### Added
- `/metaview` command for meta-analysis dashboard and ROI briefing
- Comprehensive meta-analysis briefing with performance metrics
- ROI visualization and tracking

### Changed
- Removed implicit 4-agent limit in parallel execution
- Clarified no limit on number of parallel subagents in harmony and builder agents

## [1.1.1] - 2026-01-17

### Added
- Initial meta-analysis learning loop implementation
- 4-phase development orchestration system
- Experimental validation framework

### Changed
- Enhanced documentation for multi-agent system
- Improved slash command descriptions

## [1.1.0] - 2026-01-16

### Added
- Core 4-phase workflow (Planning → Design → Implementation → Operation)
- 8-agent orchestration system
- Meta-analysis generation capability
- Parallel execution support

### Changed
- Restructured agent architecture
- Enhanced decision documentation system

## [1.0.0] - 2026-01-15

### Added
- Initial release
- Basic agent orchestration
- Claude Code plugin integration
- Core slash commands
