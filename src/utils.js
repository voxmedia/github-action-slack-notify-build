const { context } = require('@actions/github');

function buildSlackAttachments({ status, color, github, message, event_show }) {
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
          value: sha ? `<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>` : branch,
          short: true,
        };

  var attachment = {
    color,
    fields: [
      {
        title: 'Action',
        value: sha ? `<https://github.com/${owner}/${repo}/commit/${sha}/checks | ${workflow}>` : workflow,
        short: true,
      },
      {
        title: 'Status',
        value: status,
        short: true,
      },
      {
        title: 'Repo',
        value: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
        short: true,
      },
      {
        title: 'Author',
        value: actor,
        short: true,
      },
    ],
    footer_icon: 'https://github.githubassets.com/favicon.ico',
    ts: Math.floor(Date.now() / 1000),
  };

  if (event_show) attachment.fields.push(referenceLink);

  if (message)
    attachment.fields.push({
      title: 'Message',
      value: message,
      short: false,
    });

  return [attachment];
}

module.exports.buildSlackAttachments = buildSlackAttachments;

function formatChannelName(channel) {
  return channel.replace(/[#@]/g, '');
}

module.exports.formatChannelName = formatChannelName;
