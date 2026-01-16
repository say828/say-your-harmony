# Say Your Harmony

<div align="center">

## 🎼 v1.0.0 - Ever-Evolving Agent Orchestration Powered by Meta-Analysis

**4-Phase Development System for Claude Code**

[![npm version](https://img.shields.io/npm/v/say-your-harmony.svg)](https://www.npmjs.com/package/say-your-harmony)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)

[![8 Agents](https://img.shields.io/badge/Agents-8-blue)](./src/agents)
[![4 Skills](https://img.shields.io/badge/Skills-4-purple)](./skills)
[![7 Commands](https://img.shields.io/badge/Commands-7-orange)](./commands)
[![4x Efficiency](https://img.shields.io/badge/Parallel%20Speedup-4.25x-brightgreen)](#)

[Install](#-installation) • [Quick Start](#-quick-start) • [Architecture](#-the-8-agent-system) • [Philosophy](#-philosophy)

---

### 🎯 The Harmony Principle

> **"Built on Sisyphus's persistence, enhanced with meta-analysis for continuous evolution."**

Every development task follows **four mandatory phases**: Planning → Design → Implementation → Operation. Each phase generates insights. Every session produces meta-analysis. **The system continuously evolves**, learning from patterns, decisions, and outcomes.

**Sisyphus taught us persistence. Harmony adds systematic reflection. Together, they achieve ever-improving orchestration.**

</div>

---

## 🎯 Philosophy

Say-Your-Harmony enforces a structured development methodology through four mandatory phases:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│  PLANNING   │ →  │   DESIGN    │ →  │ IMPLEMENTATION  │ →  │  OPERATION  │
└─────────────┘    └─────────────┘    └─────────────────┘    └─────────────┘
     │                  │                    │                     │
     ▼                  ▼                    ▼                     ▼
 • Problem          • Architecture       • Parallel           • Deployment
 • Requirements     • Decisions         • Testing            • Verification
 • Information      • Tradeoffs         • Risk Analysis      • Meta-Analysis
```

### Core Principles

1. **Structured Workflow**: Every task goes through all 4 phases systematically
2. **Parallel Execution**: Independent tasks run concurrently (4x efficiency target)
3. **Decision Documentation**: Every choice has documented rationale (Why/What/Alternatives)
4. **Meta-Analysis Culture**: Extract patterns and learnings after every session
5. **Continuous Improvement**: Use meta-analysis insights to enhance future performance

---

## 🤖 The 8-Agent System

### Core Agents (4-Phase Workflow)

| Agent | Phase | Role | Model |
|-------|-------|------|-------|
| **harmony** | Orchestrator | Enforces 4-phase workflow, coordinates agents | opus |
| **planner** | Phase 1 | Problem definition, requirements, information gathering | opus |
| **architect** | Phase 2 | Architecture design, decision docs, tradeoff analysis | opus |
| **builder** | Phase 3 | Parallel implementation, testing, risk analysis | sonnet |
| **operator** | Phase 4 | Deployment, verification, meta-analysis generation | sonnet |

### Support Agents

| Agent | Role | Model |
|-------|------|-------|
| **explorer** | Fast codebase search and pattern discovery | haiku |
| **documenter** | Technical writing and documentation | haiku |
| **meta-analyzer** | Session analysis and pattern extraction | opus |

---

## ⚡ Quick Install

### Option A: Clone and Build (Development)

\`\`\`bash
git clone https://github.com/say/say-your-harmony.git
cd say-your-harmony
npm install
npm run build
\`\`\`

### Option B: npm Package (Coming Soon)

\`\`\`bash
npm install -g say-your-harmony
\`\`\`

---

## 📖 Usage

### Basic Workflow

When you receive a development task, the **harmony** orchestrator will automatically:

1. **Phase 1 (Planning)**: Invoke `planner` to gather requirements
2. **Phase 2 (Design)**: Invoke `architect` to design architecture
3. **Phase 3 (Implementation)**: Invoke `builder` to code in parallel
4. **Phase 4 (Operation)**: Invoke `operator` to deploy and verify

### Manual Agent Invocation

You can also invoke specific agents directly:

\`\`\`bash
# Invoke planner for a new feature
Task({ subagent_type: "planner", prompt: "Plan authentication system" })

# Invoke architect for design
Task({ subagent_type: "architect", prompt: "Design rate limiting architecture" })

# Invoke builder for implementation
Task({ subagent_type: "builder", prompt: "Implement auth handlers" })

# Invoke operator for deployment
Task({ subagent_type: "operator", prompt: "Deploy and verify build" })
\`\`\`

---

## 🎯 Real-World Example

### From Development Philosophy (Phase 1 Security Implementation)

**Task**: Implement brute force protection for token API

**Results**:
- **43 turns** total across 6 stages
- **4.25x efficiency** gain via parallel execution
  - 5 phase documents: 25min → 5min (5x speed)
  - 4 code files: 40min → 10min (4x speed)
  - 2 analyses: 20min → 5min (4x speed)
- **100% subagent success rate** (11/11 parallel tasks succeeded)
- **2 P0 risks** caught and fixed (X-Forwarded-For spoofing, memory leak)
- **Meta-analysis** generated for future improvements

### What Made It Work

1. **Correct Problem Definition** (5 turns in Planning)
   - Read ALL relevant documents first
   - Verified user's primary source

2. **Design Documentation** (8 turns in Design)
   - Decision tree: In-memory (Bucket4j) vs Redis vs Spring Cloud Gateway
   - Tradeoff analysis: Security vs UX (10 req/min → 30 req/min)
   - Risk classification: P0 (X-Forwarded-For), P1 (memory leak), P2 (monitoring)

3. **Parallel Implementation** (10 turns in Implementation)
   - 4 code files implemented simultaneously
   - Tests written alongside code
   - All builds succeeded

4. **Verification & Meta-Analysis** (12 turns in Operation)
   - All tests passed
   - P0 risks validated as fixed
   - Meta-analysis document created (566 lines)
   - Reusable patterns extracted

---

## 📊 Meta-Analysis & Continuous Improvement

After every major task, the **operator** agent automatically generates a comprehensive meta-analysis:

### What Gets Analyzed

1. **Tool Usage Patterns** (Read: 16x, Task: 12x, Edit: 6x, etc.)
2. **Decision Trees** (Why chose A over B? What alternatives?)
3. **Problem-Solving Patterns** (How did we handle blockers?)
4. **Efficiency Metrics** (Parallel speedup, time savings)
5. **Reusable Patterns** (Templates, frameworks for future tasks)
6. **Improvement Opportunities** (What could be better?)

### Meta-Analysis Output

\`\`\`markdown
docs/meta/session-2026-01-16-14-30.md

## Session Meta-Analysis: [Task Name]

### Executive Summary
[2-3 sentences: what was accomplished]

### Phase Breakdown
- Planning: X turns, Y minutes
- Design: X turns, Y minutes
- Implementation: X turns, Y minutes (Z components parallel)
- Operation: X turns, Y minutes

### Efficiency Metrics
- Parallel execution: 4.25x speedup
- Time saved: 65 minutes (76% reduction)

### Decision Trees
[All major decisions documented]

### Problem-Solving Patterns
[Reusable approaches captured]

### Improvement Opportunities
[Actionable recommendations]
\`\`\`

---

## 🏗️ Architecture

### Agent Flow

\`\`\`mermaid
graph TD
    A[User Request] --> B[harmony]
    B --> C[planner]
    C --> D[architect]
    D --> E[builder]
    E --> F[operator]
    F --> G[meta-analyzer]

    H[explorer] -.-> C
    H -.-> D
    I[documenter] -.-> E

    G --> J[docs/meta/session.md]
\`\`\`

### Parallel Execution

\`\`\`mermaid
graph LR
    A[builder] --> B1[Component 1]
    A --> B2[Component 2]
    A --> B3[Component 3]
    A --> B4[Component 4]

    B1 --> C[4x Speedup]
    B2 --> C
    B3 --> C
    B4 --> C
\`\`\`

---

## 📁 Project Structure

\`\`\`
say-your-harmony/
├── src/
│   ├── agents/          # 8 agent implementations
│   │   ├── harmony.ts         # Main orchestrator
│   │   ├── planner.ts         # Phase 1: Planning
│   │   ├── architect.ts       # Phase 2: Design
│   │   ├── builder.ts         # Phase 3: Implementation
│   │   ├── operator.ts        # Phase 4: Operation
│   │   ├── explorer.ts        # Support: Code search
│   │   ├── documenter.ts      # Support: Documentation
│   │   └── meta-analyzer.ts   # Support: Meta-analysis
│   ├── features/        # Feature modules
│   ├── cli/             # CLI entry point
│   └── index.ts         # Main exports
├── docs/
│   ├── planning/        # Phase 1 documents
│   ├── design/          # Phase 2 documents
│   ├── implementation/  # Phase 3 documents
│   └── meta/            # Meta-analysis documents
├── new/                 # Development philosophy
│   ├── summary.md       # Phase 1 meta-analysis
│   ├── session.md       # Full session transcript
│   └── development-philosophy.md  # Core principles
└── package.json
\`\`\`

---

## 🎓 Development Philosophy

This project embodies a proven development methodology extracted from real-world successful implementations. See `new/development-philosophy.md` for the complete philosophy, including:

- **6-Phase Workflow** → 4-Phase mapping
- **Parallel Execution Strategies** (4.25x efficiency)
- **Decision Documentation Culture**
- **Meta-Analysis as Standard Practice**
- **P0/P1/P2/P3 Risk Classification**
- **Problem-Solving Patterns**

### Key Mantras

1. **"Correct problem definition is 50% of success"** (Planning)
2. **"Every decision needs documented rationale"** (Design)
3. **"Parallel execution is key to 4x efficiency"** (Implementation)
4. **"Never stop at 'works' - push to production-ready"** (Operation)

---

## 🔧 Configuration

Create `.harmonyrc.yaml` in your project root:

\`\`\`yaml
# 4-Phase Workflow Configuration
agents:
  model: "claude-3.5-sonnet"  # Default LLM model

# Orchestrator behavior
orchestrator:
  auto_todos: true            # Auto-create todo lists
  verify_before_harmony: true # Verify before declaring success
  parallel_execution: true    # Enable parallel agents

# Phase-specific settings
planner:
  max_context_gathering: 10   # Max turns for context gathering

architect:
  require_decision_docs: true # Enforce decision documentation
  risk_classification: true   # Mandatory P0/P1/P2/P3

builder:
  parallel_threshold: 2       # Min components for parallel execution
  test_coverage_min: 80       # Minimum test coverage %

operator:
  auto_meta_analysis: true    # Generate meta-analysis after completion
  deployment_verification: true
\`\`\`

---

## 📊 Comparison: say-your-harmony vs say-your-harmony

| Aspect | say-your-harmony | say-your-harmony |
|--------|----------------------|------------------|
| **Agent Count** | 12 agents (specialized roles) | 8 agents (4-phase workflow) |
| **Philosophy** | Task-based agent delegation | 4-phase structured workflow |
| **Orchestration** | Harmony orchestrator | Harmony orchestrator |
| **Workflow** | Flexible agent routing | Mandatory 4-phase progression |
| **Meta-Analysis** | Optional | Mandatory after every session |
| **Decision Docs** | Optional | Mandatory for all decisions |
| **Risk Classification** | Not enforced | Mandatory P0/P1/P2/P3 |
| **Parallel Execution** | Available | Target 4x efficiency |
| **Continuous Improvement** | Manual | Automated via meta-analysis |

---

## 🤝 Contributing

Contributions are welcome! This project follows the 4-phase workflow:

1. **Planning**: Open an issue describing the problem
2. **Design**: Propose architecture with decision rationale
3. **Implementation**: Submit PR with tests and parallel execution where possible
4. **Operation**: Include meta-analysis of your development session

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

This project builds upon the excellent foundation provided by [**oh-my-claude-sisyphus**](https://github.com/Yeachan-Heo/oh-my-claude-sisyphus), created by Yeachan Heo. We are deeply grateful for:

- **Agent orchestration architecture**: The multi-agent delegation system and skill-based routing
- **Sisyphus's persistence principle**: The unwavering commitment to task completion
- **Technical implementation**: TypeScript infrastructure, Claude Agent SDK integration, and tool management
- **Open-source spirit**: Making sophisticated orchestration accessible to all

Say-Your-Harmony enhances this foundation with:
- Mandatory 4-phase structured workflow (Planning → Design → Implementation → Operation)
- Systematic meta-analysis for continuous improvement
- Decision documentation culture with full rationale
- Target 4.25x efficiency through parallel execution
- Production-ready standards enforcement

We stand on the shoulders of giants. Thank you, **oh-my-claude-sisyphus**, for showing us the way.

---

### Additional Credits

- Development philosophy from Phase 1 security implementation (2026-01-16)
- Built with Claude Code and the Anthropic API
- Inspired by real-world proven methodologies

---

## 📚 Further Reading

- [Development Philosophy](new/development-philosophy.md) - Core principles and proven patterns
- [Phase 1 Meta-Analysis](new/summary.md) - Real-world session analysis
- [Phase 1 Full Session](new/session.md) - Complete transcript

---

**Say Your Harmony** - Where every development task follows the four phases of excellence.

*Planning → Design → Implementation → Operation → Continuous Improvement* 🎯
