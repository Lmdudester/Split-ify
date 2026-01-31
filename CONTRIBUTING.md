# Contributing to Split-ify

## Documentation Guidelines

### When to Update Docs

1. **Every Commit**: Write clear commit messages describing the "why"
2. **After Each Feature**: Add entry to CHANGELOG.md `[Unreleased]` section
3. **Before Each Release**: Update README.md and move CHANGELOG entries to versioned section

### CHANGELOG Format

Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/):
- Use `[Unreleased]` for work in progress
- Categorize: Added, Changed, Deprecated, Removed, Fixed, Security
- Write for users, not developers (save technical details for commit messages)

### README Updates

Update these sections when relevant:
- **Features**: New user-facing capabilities
- **Usage**: Changes to user workflow
- **How It Works**: Architectural changes
- **Tech Stack**: New dependencies or major refactors

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes (rare for this project)
- **MINOR**: New features, significant improvements
- **PATCH**: Bug fixes, minor tweaks

### Release Checklist

- [ ] All tests passing (when tests exist)
- [ ] CHANGELOG `[Unreleased]` entries moved to new version
- [ ] README updated to reflect changes
- [ ] package.json version bumped
- [ ] Git tag created: `git tag vX.Y.Z`
- [ ] Commit: "Release vX.Y.Z: [brief summary]"

### Per-Feature Workflow

When completing a feature:
1. Add entry to `[Unreleased]` in CHANGELOG.md
2. Commit: "Update CHANGELOG for [feature name]"

When cutting a release:
1. Review CHANGELOG `[Unreleased]` section
2. Update README to reflect all unreleased changes
3. Move CHANGELOG entries from `[Unreleased]` to `[vX.Y.Z] - DATE`
4. Update package.json version
5. Commit: "Release vX.Y.Z: [brief summary]"
6. Tag: `git tag vX.Y.Z`

### Git Alias Helper

Add to `.bashrc` or `.zshrc` for quick CHANGELOG drafts:
```bash
alias changelog-commits='git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s" --no-merges'
```

Usage: `changelog-commits` outputs all commits since last tag.
