const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('isomorphic-unfetch');

try {
  const channel = core.getInput('channel');
  const status = core.getInput('status');
  const color = core.getInput('color');
  const messageId = core.getInput('message_id');

  const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
  const slackPayload = buildSlackPayload({ channel, status, color, github, messageId });
  const chatApiMethod = Boolean(messageId) ? 'update' : 'postMessage';

  fetch(`https://slack.com/api/chat.${chatApiMethod}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(slackPayload),
  }).then(response => response.json().then(data => {
    console.log(JSON.stringify(data));
    if (data.ok) {
      core.setOutput('message_id', data.ts);
    }
  })).catch(e => console.log(JSON.stringify(e)));
} catch (error) {
  core.setFailed(error.message);
}

function buildSlackPayload({ channel, status, color, github, messageId }) {
  const { payload, ref, workflow, eventName } = github.context;
  const owner = payload.repository.owner.login;
  const name = payload.repository.name;
  const event = eventName;
  const branch =
    event === 'pull_request'
      ? payload.pull_request.head.ref
      : ref.replace('refs/heads/', '');

  const sha =
    event === 'pull_request'
      ? payload.pull_request.head.sha
      : github.context.sha;

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

  const slackPayload = {
    channel,
    attachments: [
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
    ],
  };

  if (messageId) {
    slackPayload.ts = messageId;
  }

  return slackPayload;
}
