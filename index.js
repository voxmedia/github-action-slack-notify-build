const core = require("@actions/core");
const github = require("@actions/github");
const { WebClient } = require("@slack/web-api");

(async () => {
  try {
    const channel = core.getInput("channel");
    const status = core.getInput("status");
    const color = core.getInput("color");
    const messageId = core.getInput("message_id");
    const token = process.env.SLACK_BOT_TOKEN;
    const slack = new WebClient(token);

    const attachments = buildSlackAttachments({ status, color, github });
    const apiMethod = Boolean(messageId) ? "update" : "postMessage";

    const response = await slack.chat[apiMethod]({
      channel,
      attachments
    });

    core.setOutput("message_id", response.ts);
  } catch (error) {
    core.setFailed(error.message);
  }
})();

function buildSlackAttachments({ status, color, github }) {
  const { payload, ref, workflow, eventName } = github.context;
  const owner = payload.repository.owner.login;
  const name = payload.repository.name;
  const event = eventName;
  const branch =
    event === "pull_request"
      ? payload.pull_request.head.ref
      : ref.replace("refs/heads/", "");

  const sha =
    event === "pull_request"
      ? payload.pull_request.head.sha
      : github.context.sha;

  const referenceLink =
    event === "pull_request"
      ? {
          title: "Pull Request",
          value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
          short: true
        }
      : {
          title: "Branch",
          value: `<https://github.com/${owner}/${name}/commit/${sha} | ${branch}>`,
          short: true
        };

  return [
    {
      color,
      fields: [
        {
          title: "Action",
          value: `<https://github.com/${owner}/${name}/commit/${sha}/checks | ${workflow}>`,
          short: true
        },
        {
          title: "Status",
          value: status,
          short: true
        },
        referenceLink,
        {
          title: "Event",
          value: event,
          short: true
        }
      ]
    }
  ];
}
