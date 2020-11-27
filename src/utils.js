const { context } = require('@actions/github');

function buildSlackAttachments({ status, color, github, message }) {
  const { payload, ref, workflow, eventName } = github.context;
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

  var attachment = {
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
    ],
    footer_icon: 'https://github.githubassets.com/favicon.ico',
    footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
    ts: Math.floor(Date.now() / 1000),
  };

  if (message)
    attachment['fields'].push({
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
