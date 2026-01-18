# Code Lab Assist (opencode-lab)

> **Modern AI Agent Lab & SDK for Code Automation and Experimentation**

![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)

---

Code Lab Assist (opencode-lab) provides tools and SDKs to quickly set up,
manipulate, and experiment with AI agents for code automation, LLM
applications, and workflow orchestration. Built for researchers,
developers, and teams creating agent-based software, it accelerates
prototyping and integration of advanced LLM-driven code assistants.

---

## 🚀 Features

- **Fast AI Agent Setup** – Easily initialize and manage lab agent sessions.
- **Flexible SDK** – Plug into projects and start coding with built-in models/tools.
- **LLM/Provider Agnostic** – Connect to Github Copilot, Claude, and more.
- **Session Prompting** – Experiment with prompts, agents, and models interactively.
- **Extensible** – Add new agents, models, and workflows via SDK.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18 or later
- Access to supported LLM providers (e.g. GitHub Copilot, Claude)

### Installation

```sh
npm install @opencode-ai/sdk
```

---

## 🔥 Usage Example

First, make sure your Opencode server is running:

```sh
opencode serve
```

Then use the SDK to interact with your AI agents:

```js
import { createOpencodeClient } from "@opencode-ai/sdk"

// Connect to the local Opencode server
const client = createOpencodeClient({
  baseUrl: "http://127.0.0.1:4096",
})

console.log("Opencode client initialized:", client)

const agents = await client.app.agents()
console.log("Fetched agents:", agents)

// Prompt an agent/session
const result = await client.session.prompt({
  path: { id: '<session-id>' },
  body: {
    model: { providerID: "github-copilot", modelID: "claude-sonnet-4.5" },
    parts: [{ type: "text", text: "Improve the Code Lab Assist readme via pr and github mcp" }],
  },
})

console.log("Prompt result:", result)
```

---

## ⚙️ Scripts

| Script     | Description                    |
|------------|--------------------------------|
| `start`    | Run the main example           |
| `test`     | Run (placeholder) test command |

---

## 🤖 Project Structure

```
├── index.js        # Main example code
├── package.json    # Package info
└── ...             # SDK and dependencies
```

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙋‍♂️ Contributions/Contact

Contributions, feature requests, and PRs are welcome!
- Open issues for bug reports or suggestions
- Fork and submit PRs for improvements

To join the discussion, submit issues, or participate, visit the repo or [contribute via GitHub MCP](https://github.com/features/mcp).

---

## ⭐ Attribution & Links
- SDK: [`@opencode-ai/sdk`](https://www.npmjs.com/package/@opencode-ai/sdk)
- Opencode: https://opencode.ai
- GitHub MCP: https://github.com/features/mcp
