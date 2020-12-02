const { context } = require('@actions/github');

function buildSlackAttachments({ status, color, github, environment, stage, custom_fields, last_commit }) {
  const { payload, ref, workflow, eventName, actor } = github.context;
  const { owner, repo } = context.repo;
  const event = eventName;
  const branch = event === 'pull_request' ? payload.pull_request.head.ref : ref.replace('refs/heads/', '');
  const sha = event === 'pull_request' ? payload.pull_request.head.sha : github.context.sha;

  const referenceLink =
    event === 'pull_request'
      ? {
          title: 'Pull Request',
          value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
          short: true,
        }
      : {
          title: 'Branch',
          value: `<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>`,
          short: true,
        };

  let slackAttachments = [
    {
      mrkdwn_in: ['fields'],
      color,
      fields: [
        {
          title: 'Action',
          value: `<https://github.com/${owner}/${repo}/commit/${sha}/checks | ${workflow}>`,
          short: true,
        },
        {
          title: 'Status',
          value: status,
          short: true,
        },
        referenceLink,
        {
          title: 'Event',
          value: event,
          short: true,
        },
        {
          title: 'Author',
          value: actor,
          short: true,
        },
      ],
      footer_icon: 'https://github.githubassets.com/favicon.ico',
      footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
      ts: Math.floor(Date.now() / 1000),
    },
  ];

  if (environment) {
    environment = highlight_prod(environment);
    slackAttachments[0].fields.push({
      title: 'Environment',
      value: environment,
      short: true,
    });
  }

  if (stage) {
    stage = highlight_prod(stage);
    slackAttachments[0].fields.push({
      title: 'Stage',
      value: stage,
      short: true,
    });
  }

  if (last_commit === 'true') {
    slackAttachments[0].fields.push({
      title: 'Last Commit Message',
      value: get_last_commit_message(),
      short: false,
    });
  }

  if (custom_fields) {
    custom_fields.forEach(field => slackAttachments[0].fields.push(field));
  }

  return slackAttachments;
}

module.exports.buildSlackAttachments = buildSlackAttachments;

function formatChannelName(channel) {
  return channel.replace(/[#@]/g, '');
}

function highlight_prod(text) {
  if (['prod', 'production'].includes(text)) {
    text = `\`${text}\``;
  }

  return text;
}

async function get_last_commit_message() {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const { data: message } = await octokit.git.getCommit({
    owner: owner,
    repo: repo,
    commit_sha: sha,
  });

  return message;
}

module.exports.formatChannelName = formatChannelName;
