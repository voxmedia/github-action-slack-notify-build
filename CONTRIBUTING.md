# Contribution Guidelines for Slack Notify Build

## Issues and Feature Requests

To report bugs or to request new features, you may [create a new issue](https://github.com/voxmedia/github-action-slack-notify-build/issues) on the repository. Our team will do its best to respond to your request, but we cannot guarantee a response or a solution.

## Releasing a New Version

Please use [semantic versioning](https://semver.org) when releasing new versions of the action, per [GitHub's recommendations](https://help.github.com/en/github/automating-your-workflow-with-github-actions/about-actions#versioning-your-action).

After a new PR has been merged, an engineer should run locally:

```bash
# pull down the latest changes
git checkout master && git pull

# build out the new dist code
yarn build

# commit it (where X.X is the new version)
git commit -am 'vX.X'

# tag it (where X.X is the new version)
git tag -a vX.X -m 'vX.X'

# push up the commit and the t
git push && git push --tags
```

Finally, issue a [new GitHub release](https://github.com/voxmedia/github-action-slack-notify-build/releases) for the corresponding version, detailing what has changed.

## Code of Conduct

By contributing to this repository, you are expected to abide by the [Code of Conduct laid out by Vox Product](http://code-of-conduct.voxmedia.com/).
