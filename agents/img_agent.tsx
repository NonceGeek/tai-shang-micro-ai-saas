/// sdk.tsx is the deno snippet for the interaction with micro_ai_saas table, crud with the table.

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from AI SaaSSDK!");

const router = new Router();

// Here is the txs list
const txs = [];

const agent_info = {
    addr: "",
    owner_addr: "",
    type: "",
    chat_url: "",
    source_url: ""
}

router
    .get("/", async (context) => {
        context.response.body = "Hello from img_agent!";
    })
    .get("/register", async (context) => {
        // TODO: register agent to the system before start working.
    })
    .get("/solve_task", async (context) => {
        // TODO: solve task from the system.

        // curl -X POST https://api.tokentapestry.com/text2img \
        // -H "Content-Type: application/json" \
        // -d '{
        //   "prompt": "dog",
        //   "chain": "sui",
        //   "network": "testnet",
        //   "tx": "your_transaction_hash_here"
        // }'
    })
    .post("/add_agent", async (context) => {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Parse the request body
        let payload = await context.request.body.text();
        const { addr, owner_addr, type, chat_url, source_url } = JSON.parse(payload);

        // Validate required fields
        if (!addr || !owner_addr || !type) {
            context.response.status = 400;
            context.response.body = {
                error: "Missing required fields: addr, owner_addr, and type are required"
            };
            return;
        }

        // Insert new agent
        const { data, error } = await supabase
            .from("micro_ai_saas_agents")
            .insert([
                {
                    addr,
                    owner_addr,
                    type,
                    ...(chat_url && { chat_url }),
                    ...(source_url && { source_url })
                }
            ])
            .select();

        if (error) {
            context.response.status = 500;
            context.response.body = { error: error.message };
            return;
        }

        context.response.status = 201;
        context.response.body = data;
    })
  .get("/task_unsolved", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      // To implement row-level security (RLS), uncomment and adjust the following lines:
      // , {
      //   global: {
      //     headers: { Authorization: `Bearer ${context.request.headers.get('Authorization')}` }
      //   }
      // }
    );

    let { data: micro_ai_saas, error } = await supabase
      .from("micro_ai_saas")
      .select("*")
      .or("solution.is.null,solution.eq.");

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.body = micro_ai_saas;
  })
  .get("/my_task", async (context) => {
    const queryParams = context.request.url.searchParams;
    const addr = queryParams.get("addr");
    console.log(addr);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let { data: micro_ai_saas, error } = await supabase
      .from("micro_ai_saas")
      .select("*")
      .eq("user", addr);

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.body = micro_ai_saas;
  })
  .post("/add_task", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const { user, prompt, task_type, fee, fee_unit } = JSON.parse(payload);

    // Validate required fields
    if (!user || !prompt || !task_type) {
      context.response.status = 400;
      context.response.body = {
        error:
          "Missing required fields: user, prompt, and task_type are required",
      };
      return;
    }

    // Insert new task
    const { data, error } = await supabase
      .from("micro_ai_saas")
      .insert([
        {
          user,
          prompt,
          task_type,
          ...(fee && { fee }),
          ...(fee_unit && { fee_unit }),
        },
      ])
      .select();

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.status = 201;
    context.response.body = data;
  })
  .get("/task_solved", async (context) => {
    const queryParams = context.request.url.searchParams;
    const unique_id = queryParams.get("unique_id");
    console.log(unique_id);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let { data: micro_ai_saas, error } = await supabase
      .from("micro_ai_saas")
      .select("*")
      .match({ unique_id })
      .or('solution.is.null,solution.eq.')

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.body = micro_ai_saas;
  })
  .post("/submit_solution", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const { unique_id, solution, solver } = JSON.parse(payload);

    // Validate required fields
    if (!unique_id || !solution || !solver) {
      context.response.status = 400;
      context.response.body = {
        error: "Missing required fields: unique_id, solution, and solver are required"
      };
      return;
    }

    let { data: micro_ai_saas, error: selectError } = await supabase
        .from("micro_ai_saas")
        .select("*")
        .match({ unique_id })
        .or('solution.is.null,solution.eq.')

    // Check if task exists and has no solution
    if (!micro_ai_saas || micro_ai_saas.length === 0) {
      context.response.status = 400;
      context.response.body = { error: "Task not found or solution already exists" };
      return;
    }

    // Update task
    const { data, error } = await supabase
      .from("micro_ai_saas")
      .update({ 
        solution,
        solver,
        solved_at: new Date().toISOString()
      })
      .match({ unique_id })
      .select();

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.status = 200;
    context.response.body = data;
  })
  .post("/approve_solution", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
