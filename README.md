# Table GitHub Actions

This is a GitHub action, implemented in JavaScript, which does the following:
  - Assigns an issue or pull request to a project when a specified label is applied
  - Removes an issue or pull request from a project when a specified label is removed

You can provide multiple label to project mappings as the action input.

This action works with the new GitHub ProjectNext tables (beta).

## Inputs

See `examples/table-workflow.yml`

### `ghToken`

Specify a secret GitHub API token with access to read/write issues, PRs, and project cards for the target project and repo.

Generate an API token with sufficient privileges under https://github.com/settings/tokens. Store the secret in the workflow repository's secrets as `MY_PROJECT_ASSIGNER_TEST_TOKEN`, for example. See `https://github.com/$ORG/$REPO/settings/secrets/actions`. Reference this repository secret in your workflow using:

```
ghToken: ${{ secrets.MY_PROJECT_ASSIGNER_TEST_TOKEN }}
```


## Example usage

In order to use this action, create a workflow configuration file (e.g. `table-workflow.yml`) in your repository's `.github/workflows` directory. *Note that you need to have GitHub Actions enabled for your repository in order for this to work!*

### A workflow configuration for assigning issues to projects

See `examples/table-workflow.yml`

## Development

To make changes to this action's source code, fork this repository and make any edits you need.

Rebuild the `dist/index.js` file to include all packages by running:
```
npm run build
```

If you are pushing many changes to your own fork and testing iteratively, you'll want to re-push the release tags so that your test projects can run actions with your new code.
```
git tag -d vX.y.z
git tag -a -m "vX.y.z" vX.y.z
git push --force origin master --tags  # BE CAREFUL!
```

GitHub's [GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer) helps when debugging queries.

### Testing

#### Unit testing
```
npm test
```
