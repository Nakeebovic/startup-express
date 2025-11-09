# Publishing Guide

Guide for maintainers on how to publish new versions to npm.

## Prerequisites

1. **npm account** - Create at [npmjs.com](https://www.npmjs.com/signup)
2. **npm access** - Must be a collaborator on the package
3. **Repository access** - Write access to the GitHub repository

## Pre-publish Checklist

Before publishing:

- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG.md updated with changes
- [ ] Documentation updated
- [ ] Examples tested
- [ ] README.md reflects latest changes

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features (backward compatible)
- **PATCH** (0.0.x): Bug fixes (backward compatible)

### Update Version

```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major
```

This automatically:
- Updates version in `package.json`
- Creates a git commit
- Creates a git tag

## Publishing Steps

### 1. Prepare Release

```bash
# Ensure working directory is clean
git status

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run all checks
npm run build
npm test
npm run lint
```

### 2. Update Version

```bash
# Update version (choose appropriate level)
npm version patch -m "Release v%s"

# Or manually edit package.json and create tag:
git add package.json
git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1
```

### 3. Update Changelog

Edit `CHANGELOG.md`:

```markdown
## [1.0.1] - 2024-01-20

### Fixed
- Fixed validation error for email schema
- Corrected request ID header name

### Changed
- Improved error messages for validation failures
```

Commit changes:
```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.0.1"
```

### 4. Test Package Locally

```bash
# Create tarball
npm pack

# Test in another project
cd /path/to/test-project
npm install /path/to/startup-express-1.0.1.tgz

# Run tests
node test-app.js

# Clean up
npm uninstall startup-express
cd /path/to/startup-express
rm startup-express-*.tgz
```

### 5. Login to npm

```bash
npm login
# Follow prompts to authenticate
```

Verify login:
```bash
npm whoami
```

### 6. Publish to npm

```bash
# Dry run (see what will be published)
npm publish --dry-run

# Actually publish
npm publish

# For scoped packages (first time)
npm publish --access public
```

### 7. Push to GitHub

```bash
# Push commits and tags
git push origin main
git push origin --tags
```

### 8. Create GitHub Release

1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Select the version tag (e.g., `v1.0.1`)
4. Title: `v1.0.1`
5. Description: Copy from CHANGELOG.md
6. Click "Publish release"

## Post-publish Checklist

- [ ] Package appears on npm: `https://www.npmjs.com/package/startup-express`
- [ ] Can install package: `npm install startup-express`
- [ ] Package page shows correct README
- [ ] All files included (check "Files" tab on npm)
- [ ] Test in fresh project
- [ ] GitHub release created
- [ ] Announce release (if significant)

## Testing Published Package

```bash
# Create test directory
mkdir test-published
cd test-published

# Initialize npm
npm init -y

# Install published package
npm install startup-express

# Test it works
node -e "const {setupExpress} = require('startup-express'); console.log('✓ Works!');"
```

## Rollback (If Needed)

### Unpublish a Version (within 72 hours)

```bash
# Unpublish specific version
npm unpublish startup-express@1.0.1

# ⚠️ Use with extreme caution!
```

**Note:** Unpublishing is discouraged. Instead, publish a patch version with fixes.

### Deprecate a Version

```bash
# Deprecate without removing
npm deprecate startup-express@1.0.1 "This version has bugs, please update to 1.0.2"
```

## Automated Publishing with GitHub Actions

The repository includes a GitHub Actions workflow for automated publishing.

### Setup

1. **Create npm Access Token**
   - Go to npmjs.com → Account → Access Tokens
   - Create new token with "Automation" type
   - Copy the token

2. **Add to GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token

3. **Workflow will automatically publish when:**
   - Push to `main` branch
   - All tests pass
   - Version in package.json changes

## Beta/Pre-release Versions

For testing before official release:

```bash
# Create pre-release version
npm version prerelease --preid=beta
# Creates: 1.0.1-beta.0

# Publish with beta tag
npm publish --tag beta

# Users can install:
npm install startup-express@beta
```

## Troubleshooting

### "Package already exists"
- Version in package.json already published
- Update to new version: `npm version patch`

### "You must be logged in"
```bash
npm login
```

### "403 Forbidden"
- Don't have permissions
- Contact package owner

### "Package name too similar"
- Name conflicts with existing package
- Choose different name in package.json

### Files missing from package
- Check `.npmignore`
- Ensure `dist/` is built
- Use `npm pack` to inspect tarball

### TypeScript types not working
- Verify `types` field in package.json
- Ensure `.d.ts` files in `dist/`
- Check tsconfig.json `declaration: true`

## Best Practices

1. **Test thoroughly** - Never skip testing
2. **Document changes** - Always update CHANGELOG.md
3. **Semantic versioning** - Follow semver strictly
4. **Publish during work hours** - Easier to fix issues
5. **Have rollback plan** - Know how to respond to problems
6. **Monitor after publish** - Watch for issues
7. **Communicate** - Announce significant releases

## Version History

View all published versions:

```bash
# List all versions
npm view startup-express versions

# View latest version
npm view startup-express version

# View package info
npm view startup-express
```

## Publishing Checklist Summary

```bash
# 1. Prepare
npm test && npm run lint && npm run build

# 2. Version
npm version patch

# 3. Update changelog
# Edit CHANGELOG.md

# 4. Test locally
npm pack
# Test tarball

# 5. Login
npm whoami || npm login

# 6. Publish
npm publish

# 7. Push
git push origin main --tags

# 8. Create GitHub release
# On GitHub website

# 9. Verify
npm view startup-express version
npm install startup-express  # In test project

# 10. Celebrate! 🎉
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Documentation](https://docs.npmjs.com/cli/)

---

## 👤 Maintainer

**Ahmed El Nakeeb (Nakeebovic)**
- GitHub: [@Nakeebovic](https://github.com/Nakeebovic)
- npm: [nakeebovic](https://www.npmjs.com/~nakeebovic)

For questions, open an issue or contact the maintainer.

