export type GuideStep = { title: string; body: string };
export type Guide = {
  id: "claude" | "chatgpt" | "gemini" | "api";
  label: string;
  intro: string;
  plan: string;
  steps: GuideStep[];
  tips: string[];
  troubleshooting: { q: string; a: string }[];
};

/**
 * Setup guides. Menu names were checked against vendor help pages / current docs
 * (Sep 2026). Vendors rename things often, so steps say what to look for rather
 * than promising exact pixel positions.
 */
export const GUIDES: Guide[] = [
  {
    id: "claude",
    label: "Claude Project",
    intro:
      "A Claude Project keeps your agent's instructions in one place and applies them to every chat you start inside it.",
    plan: "Projects are available on free Claude accounts too (free accounts have a limit on how many projects you can create).",
    steps: [
      { title: "Copy the prompt", body: "Press Copy prompt on the agent page. It copies the full system prompt to your clipboard." },
      { title: "Open Projects", body: "Sign in at claude.ai and open Projects from the left sidebar (or go to claude.ai/projects)." },
      { title: "Create a new project", body: "Click New project. Name it after the agent, for example \"Multiplication Facts Coach\". The name and description are just for you." },
      { title: "Add the instructions", body: "Inside the project, find the project instructions area (labelled \"Set project instructions\" at the time of writing). Paste the prompt and save." },
      { title: "Optional: add knowledge", body: "Upload a worksheet, syllabus, or reading list to the project's knowledge section so the agent can use your real materials." },
      { title: "Start a chat inside the project", body: "Open a new chat from within the project (not from the main screen). Paste one of the starter prompts to check it works." },
    ],
    tips: [
      "Always start chats from inside the project, otherwise the instructions do not apply.",
      "Make one project per learner or class so each keeps its own context.",
      "If answers drift, tell the agent \"Re-read your instructions and continue.\"",
    ],
    troubleshooting: [
      { q: "The agent just gives me the answer.", a: "Say: \"Remember, you are a coach. Ask me a guiding question instead of the answer.\" If it keeps happening, check the full prompt was pasted (not cut off)." },
      { q: "I cannot find project instructions.", a: "Vendor menus move. Look inside the project for anything named instructions or custom instructions. As a fallback, paste the prompt as your first message in a new chat." },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT Custom GPT",
    intro:
      "A Custom GPT wraps the prompt in a shareable assistant with conversation starters. Creating GPTs generally needs a paid ChatGPT plan; free users can still paste the prompt into a normal chat.",
    plan: "Creating a GPT needs a paid plan. On the free plan, use the \"paste into a chat\" fallback below.",
    steps: [
      { title: "Copy the prompt", body: "Press Copy prompt on the agent page." },
      { title: "Open the GPT builder", body: "In ChatGPT, choose Explore GPTs from the sidebar, then Create (or go to chatgpt.com/create)." },
      { title: "Switch to Configure", body: "The builder has a Create tab (a chat that drafts a GPT for you) and a Configure tab (manual fields). Choose Configure so your prompt is used exactly as written." },
      { title: "Fill in the fields", body: "Name and Description: copy from the agent page. Instructions: paste the full prompt. Conversation starters: paste the starter prompts, one per box." },
      { title: "Keep it lean", body: "Leave web browsing and code tools off unless you need them (for the Python tutor, code execution can help but is optional). Do not upload student data." },
      { title: "Test in the preview", body: "Use the preview panel on the right to try a starter prompt. Fix anything, then save." },
      { title: "Choose who can use it", body: "When saving, pick the sharing option: only you, anyone with the link, or your workspace where available. For learners, \"anyone with the link\" is a common choice." },
    ],
    tips: [
      "Treat the Instructions box as the single source of truth; do not split the prompt across fields.",
      "If the Instructions box has a character limit, keep the whole prompt; shorten only the sections you can spare (formatting rules are the safest to trim).",
    ],
    troubleshooting: [
      { q: "I am on the free plan.", a: "Start a new chat, paste the prompt as your first message, and add: \"Follow these instructions for the whole conversation.\"" },
      { q: "The GPT ignores a rule.", a: "Move that rule to the top of the Instructions and phrase it as a plain sentence, for example \"Never give the final answer to homework.\"" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini Gem",
    intro: "A Gem is Google Gemini's saved custom assistant. You give it a name and instructions and reuse it whenever you like.",
    plan: "Gems are available in the Gemini app for signed-in users; availability for school (Workspace for Education) accounts depends on your admin.",
    steps: [
      { title: "Copy the prompt", body: "Press Copy prompt on the agent page." },
      { title: "Open Gems", body: "Go to gemini.google.com, open the sidebar, and choose Gems (first-time users may need to open the Gems section from the Settings and help area)." },
      { title: "Start a new Gem", body: "Click New Gem." },
      { title: "Name and instructions", body: "Enter the agent's name. Paste the prompt into the Instructions field. Gemini also offers a rewrite helper; skip it, because rewriting can weaken safety rules." },
      { title: "Optional knowledge", body: "Under Knowledge you can add files from your device or Google Drive, such as a class syllabus." },
      { title: "Preview and save", body: "Use the preview box to test a starter prompt. When it behaves, click Save. The Gem then appears in your Gems list." },
    ],
    tips: [
      "Do not use the automatic instruction rewriter on safety-critical agents.",
      "Younger learners should use a supervised family or school account.",
    ],
    troubleshooting: [
      { q: "I do not see Gems.", a: "Gems may be unavailable for some school accounts or regions. Use a personal account with a parent's permission, or paste the prompt into a normal chat." },
    ],
  },
  {
    id: "api",
    label: "API / any model",
    intro:
      "The prompt is plain text, so it works with any chat model: use it as the system message via an API, in a local model runner, or as the first message in any chat app.",
    plan: "You need an API key from your model provider (billing may apply) or a local model runner.",
    steps: [
      { title: "Get the prompt", body: "Copy it, or download the .md/.json file, or fetch it: GET /agents/<slug>.md or /api/agents.json." },
      { title: "Use it as the system message", body: "Send the prompt as the system prompt and the learner's text as user messages. Keep the whole conversation history in every request." },
      { title: "Anthropic Messages API example", body: "See the code below. Model names change; check your provider's model list." },
      { title: "OpenAI-compatible example", body: "Most other providers and local runners accept a chat completions request with a system role message; see below." },
      { title: "Add guardrails in your app", body: "Cap message length, rate-limit users, and never let clients override the system prompt. Log nothing personal about children." },
    ],
    tips: [
      "Use a small fast model for young learners' drill-and-practice agents; use a stronger model for essay feedback and lesson planning.",
      "Temperature around 0.5 to 0.7 works well for tutors.",
    ],
    troubleshooting: [
      { q: "A local model ignores the rules.", a: "Smaller models follow long prompts less reliably. Try a larger model, or keep only the sections marked Role, Pedagogy, and Safety." },
    ],
  },
];

export const API_EXAMPLES = {
  anthropic: `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-haiku-4-5-20251001",
    "max_tokens": 1024,
    "system": "<PASTE THE AGENT PROMPT HERE>",
    "messages": [{"role": "user", "content": "Hi! Can we practice?"}]
  }'`,
  openai: `curl http://localhost:11434/v1/chat/completions \\
  -H "content-type: application/json" \\
  -d '{
    "model": "your-model-name",
    "messages": [
      {"role": "system", "content": "<PASTE THE AGENT PROMPT HERE>"},
      {"role": "user", "content": "Hi! Can we practice?"}
    ]
  }'`,
};
