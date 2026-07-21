# ADR-001: Documentation Approach

## Question

How should project knowledge, requirements, decisions, and architecture be documented and maintained?

## Context

The project is expected to evolve over time and many requirements, designs, and implementation details are not yet fully
defined.

A documentation system is needed to:

- Record decisions and their rationale
- Capture requirements and research
- Document architecture and system design
- Track progress and development notes
- Maintain project knowledge independently of implementation

The documentation should be simple, portable, version-controlled, and easy to update.

## Options Considered

### Option 1: Markdown Files in Git Repository

Pros:

- Plain text and future-proof
- Easy version control with Git
- Works with many tools
- Supports diagrams and visual assets
- Can be edited with any text editor
- Documentation lives alongside the project

Cons:

- Requires manual organization
- Less collaborative than cloud-based tools

### Option 2: Notion

Pros:

- Rich user interface
- Easy collaboration
- Built-in databases and templates

Cons:

- Cloud dependency
- Less portable
- Documentation separated from source control

## Decision

Use Markdown files stored in the project repository as the primary documentation system.

Documentation will be organized into dedicated directories for architecture, decisions, journals, and supporting assets.

Diagrams and rendered visualizations may be included where they improve understanding.

## Rationale

Markdown provides a lightweight, tool-independent format that integrates naturally with Git.

Keeping documentation within the repository ensures that project knowledge evolves alongside the codebase and remains
accessible without dependence on external platforms.

The approach also allows integration with tools such as:

- Obsidian
- Mermaid
- Excalidraw
- dbdiagram.io
- Draw.io

while preserving Markdown as the source of truth.

## Consequences

### Positive

- Documentation remains portable and version-controlled
- Easy integration with development workflow
- Compatible with many documentation and diagramming tools
- Low maintenance overhead

### Negative

- Requires discipline to keep documentation current
- No built-in collaboration features beyond Git workflows
- Folder structure must be maintained manually

## Revisit Conditions

This decision should be reconsidered if:

- Documentation collaboration becomes a primary requirement
- Non-technical stakeholders require a more user-friendly platform
- Documentation volume grows beyond what is manageable in Markdown alone
