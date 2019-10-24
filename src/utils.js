function buildSlackAttachments({ status, color, github }) {
  const { payload, ref, workflow, eventName } = github.context;
  const owner = payload.repository.owner.login;
  const name = payload.repository.name;
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
          value: `<https://github.com/${owner}/${name}/commit/${sha} | ${branch}>`,
          short: true,
        };

  return [
    {
      color,
      fields: [
        {
          title: 'Action',
          value: `<https://github.com/${owner}/${name}/commit/${sha}/checks | ${workflow}>`,
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
    },
  ];
}

module.exports.buildSlackAttachments = buildSlackAttachments;
