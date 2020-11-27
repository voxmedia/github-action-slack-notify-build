const repository = {
  name: 'github-action-slack-notify-build',
  owner: {
    login: 'voxmedia',
  },
};

export const GITHUB_PUSH_EVENT = {
  context: {
    payload: {
      repository,
    },
    actor: 'Codertocat',
    ref: 'refs/heads/my-branch',
    workflow: 'CI',
    eventName: 'push',
    sha: 'abc123',
  },
};

export const GITHUB_PR_EVENT = {
  context: {
    payload: {
      repository,
      pull_request: {
        html_url: 'https://github.com/voxmedia/github-action-slack-notify-build/pulls/1',
        title: 'This is a PR',
        head: {
          ref: 'my-branch',
          sha: 'xyz678',
        },
      },
    },
    actor: 'Codertocat',
    workflow: 'CI',
    eventName: 'pull_request',
    sha: 'abc123',
  },
};
