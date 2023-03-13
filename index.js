const core = require('@actions/core');
const github = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const { buildSlackAttachments, formatChannelName } = require('./src/utils');

(async () => {
  try {
    const channel = core.getInput('channel');
    const status = core.getInput('status');
    const build = core.getInput('build');
    const environment = core.getInput('environment');
    const color = core.getInput('color');
    const messageId = core.getInput('message_id');
    const token = process.env.SLACK_BOT_TOKEN;
    const slack = new WebClient(token);

    if (!build && !core.getInput('build')) {
      core.setFailed(`You must provide a 'build' value, use N/A if not applicable.`);
    }

    if (!environment && !core.getInput('environment')) {
      core.setFailed(`You must provide a 'environment' value.`);
    }

    if (!channel && !core.getInput('channel_id')) {
      core.setFailed(`You must provide either a 'channel' or a 'channel_id'.`);
      return;
    }

    const attachments = buildSlackAttachments({ status, build, environment, color, github });
    const channelId = core.getInput('channel_id') || (await lookUpChannelId({ slack, channel }));

    if (!channelId) {
      core.setFailed(`Slack channel ${channel} could not be found.`);
      return;
    }

    const apiMethod = Boolean(messageId) ? 'update' : 'postMessage';

    const args = {
      channel: channelId,
      attachments,
    };

    if (messageId) {
      args.ts = messageId;
    }

    const response = await slack.chat[apiMethod](args);

    core.setOutput('message_id', response.ts);
  } catch (error) {
    core.setFailed(error);
  }
})();

async function lookUpChannelId({ slack, channel }) {
  let result;
  const formattedChannel = formatChannelName(channel);

  // Async iteration is similar to a simple for loop.
  // Use only the first two parameters to get an async iterator.
  for await (const page of slack.paginate('conversations.list', { types: 'public_channel, private_channel' })) {
    // You can inspect each page, find your result, and stop the loop with a `break` statement
    const match = page.channels.find(c => c.name === formattedChannel);
    if (match) {
      result = match.id;
      break;
    }
  }

  return result;
}
