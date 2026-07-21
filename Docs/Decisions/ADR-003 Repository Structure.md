# ADR-003: Repository Structure

## Question

How should the repository be organized to separate documentation, application code, and experimentation while
maintaining a clear project structure?

## Context

The project contains multiple types of assets:

- Documentation and project knowledge
- Frontend application code
- Backend application code
- Experimental code and prototypes
- Repository metadata and configuration

A consistent structure is required to:

- Reduce ambiguity when adding new files
- Improve discoverability
- Support project growth
- Keep documentation close to implementation
- Isolate experiments from production code

## Options Considered

### Option 1: Monolithic Structure

Place all code, documentation, and experiments in a small number of directories.

Pros:

- Simple initial setup
- Fewer directories

Cons:

- Becomes difficult to navigate as the project grows
- Responsibilities become mixed

### Option 2: Responsibility-Based Structure

Separate documentation, frontend, backend, and experimental work into dedicated directories.

Pros:

- Clear ownership and purpose
- Easier navigation
- Better scalability
- Simplifies onboarding

Cons:

- Slightly more structure to maintain

## Decision

Use a responsibility-based repository structure.

```text
/
├── docs/
├── client/
├── server/
├── experiments/
├── README.md
├── LICENSE
└── .gitignore
```
