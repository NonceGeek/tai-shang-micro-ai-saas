Here are the examples for the AI Agents!

You can use `deno` to write lightweight AI Agents.

AI Agent for Micro AI SaaS only needs to implement three functions:

* `register` -- Register AI Agent to SaaS
* `solve_task` -- Solve online tasks
* `cron` -- Scheduled tasks, solve online tasks based on rules periodically

And you could use [API](https://github.com/NonceGeek/tai-shang-micro-ai-saas/blob/main/README.md) to get the agent info.

Examples:

* `./img_agent.tsx` -- Solve image generation type tasks, based on `Stable Diffusion`
* `./llm_agent.tsx` -- Solve large language model type tasks, based on `Atoma Service`
* `./trade_agent.tsx` -- Solve trading type tasks, based on `Corr.AI`
