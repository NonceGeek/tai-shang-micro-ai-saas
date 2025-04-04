// TODO: like the img_agent.tsx, implement the llm_agent.tsx for the llm task.

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

console.log("Hello from LLM Agent!");

const router = new Router();

const agent_info = {
  addr: "0x32176759d58d96a006484fab925831d01e74d132a6d094e82514e6e1c787b112", 
  owner_addr:
    "0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed",
  type: "llm",
  chat_url: "https://analyzer.rootmud.xyz/",
  source_url:
    "https://github.com/NonceGeek/tai-shang-micro-ai-saas/blob/main/agents/project_analyzer_agent.tsx",
  task_request_api: "https://proj-agent.deno.dev/solve_task",
  description:
    "I'm a github analyzer agent based on OpenAI!",
};

Deno.cron("llm agent", "*/10 * * * *", () => {
  console.log("This will run every 10 minutes");
});

router
  .get("/", async (context) => {
    context.response.body = "Hello from project analyzer agent!";
  })
  .get("/register", async (context) => {
    // Register agent to the system before start working
    const registerResponse = await fetch("https://ai-saas.deno.dev/add_agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addr: agent_info.addr,
        owner_addr: agent_info.owner_addr,
        type: agent_info.type,
        chat_url: agent_info.chat_url,
        source_url: agent_info.source_url,
        description: agent_info.description,
        task_request_api: agent_info.task_request_api,
      }),
    });

    if (!registerResponse.ok) {
      context.response.status = 500;
      context.response.body = { error: "Failed to register agent" };
      return;
    }

    const result = await registerResponse.json();

    console.log("result", result);
    const kv = await Deno.openKv();
    // Save a info to deno kv.
    kv.set(["agent_info"], JSON.stringify(result[0], null, 2));

    context.response.status = 200;
    context.response.body = {
      message: "Agent registered successfully",
      data: result,
    };
  })
  .get("/get_agent_info", async (context) => {
    const kv = await Deno.openKv();
    const agent_info = await kv.get(["agent_info"]);
    context.response.body = JSON.parse(agent_info.value);
  })
//   .get("/openai_api_key", async (context) => {
//     const kv = await Deno.openKv();
//     const result = await kv.get(["OPENAI_API_KEY"]);
//     context.response.body = result.value;
//   })
  .get("/set_openai_api_key", async (context) => {
    const apiKey = context.request.url.searchParams.get("key");
    const kv = await Deno.openKv();
    await kv.set(["OPENAI_API_KEY"], apiKey);
    context.response.body = { message: "API key set successfully" };
  })
  .get("/solve_task", async (context) => {
    const queryParams = context.request.url.searchParams;
    const task_id = queryParams.get("task_id");
    const kv = await Deno.openKv();
    // TODO: implement the project analyzer agent.
    context.response.body = { message: "TODO: need to impl" };
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
