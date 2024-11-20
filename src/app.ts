import { Octokit } from "@octokit/rest";
import { createNodeMiddleware } from "@octokit/webhooks";
import { WebhookEventMap } from "@octokit/webhooks-definitions/schema";
<<<<<<< HEAD
import * as http from "http";
import { App } from "octokit";
import { Review } from "./constants";
import { env } from "./env";
import { processPullRequest } from "./review-agent";
import { applyReview } from "./reviews";

// This creates a new instance of the Octokit App class.
const reviewApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_PRIVATE_KEY,
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
});

const getChangesPerFile = async (payload: WebhookEventMap["pull_request"]) => {
  try {
    const octokit = await reviewApp.getInstallationOctokit(
      payload.installation.id
    );
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
    });
    console.dir({ files }, { depth: null });
    return files;
  } catch (exc) {
    console.log("exc");
    return [];
  }
=======
import {
	logPRInfo,
	processPullRequest,
	reviewChanges,
	reviewDiff,
} from "./review-agent";
import { applyReview } from "./reviews";
import { Review } from "./constants";

const devEnv = process.env.NODE_ENV != "production";
console.log(devEnv);

const appId = devEnv ? process.env.DEV_APP_ID : process.env.APP_ID;
const webhookSecret = devEnv
	? process.env.DEV_WEBHOOK_SECRET
	: process.env.WEBHOOK_SECRET;

// This reads the contents of your private key file.
const privateKey = Buffer.from(
	devEnv ? process.env.DEV_PRIVATE_KEY : process.env.PRIVATE_KEY,
	"base64"
).toString("utf-8");

// This creates a new instance of the Octokit App class.
const reviewApp = new App({
	appId: appId,
	privateKey: privateKey,
	webhooks: {
		secret: webhookSecret,
	},
});

const getChangesPerFile = async (payload: WebhookEventMap["pull_request"]) => {
	console.log("get changes per file function on");
	try {
		const { data: files } = await (
			await reviewApp.getInstallationOctokit(payload.installation.id)
		).rest.pulls.listFiles({
			owner: payload.repository.owner.login,
			repo: payload.repository.name,
			pull_number: payload.pull_request.number,
		});
		return files;
	} catch (exc) {
		console.log("exc");
		return [];
	}
>>>>>>> 3155c33 (Configure setup)
};

// This adds an event handler that your code will call later. When this event handler is called, it will log the event to the console. Then, it will use GitHub's REST API to add a comment to the pull request that triggered the event.
async function handlePullRequestOpened({
<<<<<<< HEAD
  octokit,
  payload,
}: {
  octokit: Octokit;
  payload: WebhookEventMap["pull_request"];
}) {
  console.log(
    `Received a pull request event for #${payload.pull_request.number}`
  );
  // const reposWithInlineEnabled = new Set<number>([601904706, 701925328]);
  // const canInlineSuggest = reposWithInlineEnabled.has(payload.repository.id);
  try {
    console.log("pr info", {
      id: payload.repository.id,
      fullName: payload.repository.full_name,
      url: payload.repository.html_url,
    });
    const files = await getChangesPerFile(payload);
    const review: Review = await processPullRequest(
      octokit,
      payload,
      files,
      true
    );
    await applyReview({ octokit, payload, review });
    console.log("Review Submitted");
  } catch (exc) {
    console.log(exc);
  }
=======
	octokit,
	payload,
}: {
	octokit: Octokit;
	payload: WebhookEventMap["pull_request"];
}) {
	console.log(
		`Received a pull request event for #${payload.pull_request.number}`
	);
	// const reposWithInlineEnabled = new Set<number>([601904706, 701925328]);
	// const canInlineSuggest = reposWithInlineEnabled.has(payload.repository.id);
	try {
		logPRInfo(payload);
		const files = await getChangesPerFile(payload);
		const review: Review = await processPullRequest(
			octokit,
			payload,
			files,
			"gpt-4",
			true
		);
		await applyReview({ octokit, payload, review });
		console.log("Review Submitted");
	} catch (exc) {
		console.log(exc);
	}
>>>>>>> 3155c33 (Configure setup)
}

// This sets up a webhook event listener. When your app receives a webhook event from GitHub with a `X-GitHub-Event` header value of `pull_request` and an `action` payload value of `opened`, it calls the `handlePullRequestOpened` event handler that is defined above.
//@ts-ignore
reviewApp.webhooks.on("pull_request.opened", handlePullRequestOpened);

const port = process.env.PORT || 3000;
const reviewWebhook = `/api/review`;
const rootPath = `/`;

const reviewMiddleware = createNodeMiddleware(reviewApp.webhooks, {
<<<<<<< HEAD
  path: "/api/review",
});

const server = http.createServer((req, res) => {
  if (req.url === reviewWebhook) {
    reviewMiddleware(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

// This creates a Node.js server that listens for incoming HTTP requests (including webhook payloads from GitHub) on the specified port. When the server receives a request, it executes the `middleware` function that you defined earlier. Once the server is running, it logs messages to the console to indicate that it is listening.
server.listen(port, () => {
  console.log(`Server is listening for events.`);
  console.log("Press Ctrl + C to quit.");
=======
	path: "/api/review",
});

const server = http.createServer((req, res) => {
	console.log("req url", req.url);
	console.log(reviewWebhook);
	if (req.url === reviewWebhook || req.url === rootPath) {
		console.log("Review Webhook");
		reviewMiddleware(req, res);
		console.log("Review Webhook Done");
	} else {
		console.log("Not Review Webhook, 404, req.url", req.url);
		res.statusCode = 404;
		res.end();
	}
});

// This creates a Node.js server that listens for incoming HTTP requests (including webhook payloads from GitHub) on the specified port. When the server receives a request, it executes the `middleware` function that you defined earlier. Once the server is running, it logs messages to the console to indicate that it is listening.
server.listen(port, () => {
	console.log(`Server is listening for events.`);
	console.log("Press Ctrl + C to quit.");
>>>>>>> 3155c33 (Configure setup)
});
