/// sdk.tsx is the deno snippet for the interaction with micro_ai_saas table, crud with the table.

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { CSS, render } from "@deno/gfm";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Wallet, verifyMessage } from "https://esm.sh/ethers@6";

console.log("Hello from AI Agent Market's API Server!");

// Helper function to calculate SHA256 hash
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Admin password verification function
async function verifyAdminPassword(
  context: any,
  password: string
): Promise<boolean> {
  const adminPwd = Deno.env.get("ADMIN_PWD");
  if (!password || password !== adminPwd) {
    context.response.status = 401;
    context.response.body = { error: "Unauthorized: Invalid password" };
    return false;
  }
  return true;
}

const router = new Router();

router
  .get("/", async (context) => {
    context.response.body = "Hello from AI Agent Market's API Server!";
  })
  .get("/v2/whitepaper/cn", async (context) => {
    try {
      const readmeText = await Deno.readTextFile("./whitepaper.md");
      context.response.body = readmeText;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  .get("/v2/whitepaper/en", async (context) => {
    try {
      const readmeText = await Deno.readTextFile("./whitepaper-en.md");
      context.response.body = readmeText;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  .get("/v2/whitepaper/cn/html", async (context) => {
    try {
      // Read README.md file
      const readmeText = await Deno.readTextFile("./whitepaper.md");

      // Render markdown to HTML with GFM styles
      const body = render(readmeText);

      // Create complete HTML document with GFM CSS
      const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaiShang AI Agent Market Whitepaper</title>
    <style>
      ${CSS}
      body {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
      }
    </style>
  </head>
  <body>
  ${body}
  </body>
  </html>`;

      // Set response headers for HTML
      context.response.headers.set("Content-Type", "text/html; charset=utf-8");
      context.response.body = html;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  .get("/v2/whitepaper/en/html", async (context) => {
    try {
      // Read README.md file
      const readmeText = await Deno.readTextFile("./whitepaper-en.md");

      // Render markdown to HTML with GFM styles
      const body = render(readmeText);

      // Create complete HTML document with GFM CSS
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaiShang AI Agent Market Whitepaper</title>
  <style>
    ${CSS}
    body {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;

      // Set response headers for HTML
      context.response.headers.set("Content-Type", "text/html; charset=utf-8");
      context.response.body = html;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  .get("/v2/docs", async (context) => {
    try {
      const readmeText = await Deno.readTextFile("./apidoc.md");
      context.response.body = readmeText;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  .get("/v2/docs/html", async (context) => {
    try {
      // Read README.md file
      const readmeText = await Deno.readTextFile("./apidoc.md");

      // Render markdown to HTML with GFM styles
      const body = render(readmeText);

      // Create complete HTML document with GFM CSS
      const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TaiShang AI Agent Market API Documentation</title>
      <style>
        ${CSS}
        body {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
      </style>
    </head>
    <body>
    ${body}
    </body>
    </html>`;

      // Set response headers for HTML
      context.response.headers.set("Content-Type", "text/html; charset=utf-8");
      context.response.body = html;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  .get("/v2/agent", async (context) => {
    const queryParams = context.request.url.searchParams;
    const addr = queryParams.get("addr");
    const unique_id = queryParams.get("unique_id");
    const owner_addr = queryParams.get("owner_addr");

    if (!addr && !unique_id && !owner_addr) {
      context.response.status = 400;
      context.response.body = {
        error: "Either addr, unique_id, or owner_addr parameter is required",
      };
      return;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    let query = supabase.from("micro_ai_saas_agents").select("*");

    if (addr) {
      query = query.eq("addr", addr);
    } else if (unique_id) {
      query = query.eq("unique_id", unique_id);
    } else if (owner_addr) {
      query = query.eq("owner_addr", owner_addr);
    }

    const { data, error } = await query;

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    if (!data || data.length === 0) {
      context.response.status = 404;
      context.response.body = { error: "No agents found" };
      return;
    }

    // If searching by addr or unique_id, return single agent
    // If searching by owner_addr, return array of agents
    if (addr || unique_id) {
      context.response.body = data[0];
    } else {
      context.response.body = data;
    }
  })
  .get("/v2/agents", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
      // To implement row-level security (RLS), uncomment and adjust the following lines:
      // , {
      //   global: {
      //     headers: { Authorization: `Bearer ${context.request.headers.get('Authorization')}` }
      //   }
      // }
    );

    let { data: agents, error } = await supabase
      .from("micro_ai_saas_agents")
      .select("*");

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.body = agents;
  })
  .get("/agent", async (context) => {
    const queryParams = context.request.url.searchParams;
    const addr = queryParams.get("addr");
    const unique_id = queryParams.get("unique_id");
    const owner_addr = queryParams.get("owner_addr");

    if (!addr && !unique_id && !owner_addr) {
      context.response.status = 400;
      context.response.body = {
        error: "Either addr, unique_id, or owner_addr parameter is required",
      };
      return;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabase.from("micro_ai_saas_agents").select("*");

    if (addr) {
      query = query.eq("addr", addr);
    } else if (unique_id) {
      query = query.eq("unique_id", unique_id);
    } else if (owner_addr) {
      query = query.eq("owner_addr", owner_addr);
    }

    const { data, error } = await query;

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    if (!data || data.length === 0) {
      context.response.status = 404;
      context.response.body = { error: "No agents found" };
      return;
    }

    // If searching by addr or unique_id, return single agent
    // If searching by owner_addr, return array of agents
    if (addr || unique_id) {
      context.response.body = data[0];
    } else {
      context.response.body = data;
    }
  })
  .get("/agents", async (context) => {
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

    let { data: agents, error } = await supabase
      .from("micro_ai_saas_agents")
      .select("*");

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.body = agents;
  })
  .post("/v2/add_agent", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const {
      password,
      addr,
      addrs,
      owner_addr,
      type,
      homepage,
      source_url,
      description,
      name,
      task_request_api,
    } = JSON.parse(payload);

    // Verify admin password
    if (!(await verifyAdminPassword(context, password))) {
      return { error: "Unauthorized: Invalid password" };
    }

    // Validate required fields
    if (!addr || !owner_addr || !type) {
      context.response.status = 400;
      context.response.body = {
        error:
          "Missing required fields: addr, owner_addr, and type are required",
      };
      return;
    }

    // Parse addrs if it's provided as a string, otherwise use it as-is
    let parsedAddrs = null;
    if (addrs) {
      if (typeof addrs === "string") {
        try {
          parsedAddrs = JSON.parse(addrs);
        } catch (e) {
          context.response.status = 400;
          context.response.body = {
            error:
              "Invalid addrs format: must be a valid JSON object or string",
          };
          return;
        }
      } else if (typeof addrs === "object") {
        parsedAddrs = addrs;
      } else {
        context.response.status = 400;
        context.response.body = {
          error: "Invalid addrs format: must be a JSON object",
        };
        return;
      }
    }

    // Insert new agent
    const insertData: Record<string, any> = {
      addr,
      owner_addr,
      type,
      description,
      task_request_api,
      name,
    };

    if (homepage) insertData.homepage = homepage;
    if (source_url) insertData.source_url = source_url;
    if (parsedAddrs) insertData.addrs = parsedAddrs;

    const { data, error } = await supabase
      .from("micro_ai_saas_agents")
      .insert([insertData])
      .select();

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.status = 201;
    context.response.body = data[0];
  })
  // TODO: update_agent
  .post("/add_agent", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const {
      password,
      addr,
      owner_addr,
      type,
      chat_url,
      source_url,
      description,
      task_request_api,
    } = JSON.parse(payload);

    // Verify admin password
    if (!(await verifyAdminPassword(context, password))) {
      return { error: "Unauthorized: Invalid password" };
    }

    // Validate required fields
    if (!addr || !owner_addr || !type) {
      context.response.status = 400;
      context.response.body = {
        error:
          "Missing required fields: addr, owner_addr, and type are required",
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
          description,
          task_request_api,
          ...(chat_url && { chat_url }),
          ...(source_url && { source_url }),
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
  .get("/v2/tasks", async (context) => {
    const queryParams = context.request.url.searchParams;
    const limit = queryParams.get("limit") || "100";
    const cursor = queryParams.get("cursor");
    const unsolved = queryParams.get("unsolved") === "true";
    const ascend = queryParams.get("ascend") === "true";
    const agent_addr = queryParams.get("agent_addr");
    const owner_addr = queryParams.get("owner_addr");
    /*
    HINT:
      🔑 关键点：
      第一次请求：不传 cursor 参数，只传 ascend=false
      后续请求：使用上一次响应中的 nextCursor 作为下一次的 cursor 参数
      结束判断：当 hasMore 为 false 或 nextCursor 为 null 时，表示没有更多数据了
    */

    // Convert limit to number and validate
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 1000) {
      context.response.status = 400;
      context.response.body = {
        error: "limit must be a positive number between 1 and 1000",
      };
      return;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    try {
      // Build the query with pagination
      let query = supabase
        .from("micro_ai_saas")
        .select("*")
        .order("id", { ascending: ascend })
        .limit(limitNum);
      if (agent_addr) {
        query = query.eq("agent_addr", agent_addr);
      }
      if (owner_addr) {
        query = query.eq("owner_addr", owner_addr);
      }

      // Filter for unsolved tasks if requested
      if (unsolved) {
        query = query.or("solution.is.null,solution.eq.");
      }

      // Add cursor-based pagination if cursor is provided
      if (cursor) {
        const cursorNum = parseInt(cursor, 10);
        if (isNaN(cursorNum)) {
          context.response.status = 400;
          context.response.body = { error: "cursor must be a valid number" };
          return;
        }
        // For ascending order: get records where id > cursor
        // For descending order: get records where id < cursor
        if (ascend) {
          query = query.gt("id", cursorNum);
        } else {
          query = query.lt("id", cursorNum);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Database error:", error);
        context.response.status = 500;
        context.response.body = { error: "Database query failed" };
        return;
      }

      // Calculate next cursor for pagination
      let nextCursor = null;
      if (data && data.length === limitNum && data.length > 0) {
        // If we got exactly the limit, there might be more data
        nextCursor = data[data.length - 1].id;
      }

      context.response.body = {
        data,
        pagination: {
          limit: limitNum,
          cursor: cursor || null,
          nextCursor,
          hasMore: data && data.length === limitNum,
        },
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  })
  .post("/v2/add_task", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const { user, solver, prompt, task_type, fee, fee_unit, coupon } =
      JSON.parse(payload);

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
    const insertData: Record<string, any> = {
      user,
      solver,
      coupon,
      prompt,
      task_type,
    };

    if (fee) insertData.fee = fee;
    if (fee_unit) insertData.fee_unit = fee_unit;

    const { data, error } = await supabase
      .from("micro_ai_saas")
      .insert([insertData])
      .select();

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.status = 201;
    context.response.body = data[0];
  })
  .get("/v2/dev/gen_agent_key", async (context) => {
    // Generate a new private key for the agent
    const wallet = Wallet.createRandom();
    const privkey = wallet.privateKey;
    const addr = wallet.address;
    context.response.status = 200;
    context.response.body = {
      privkey,
      addr,
    };
  })
  .post("/v2/dev/sign_task", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const { unique_id, privkey } = JSON.parse(payload);

    // Validate required fields
    if (!unique_id || !privkey) {
      context.response.status = 400;
      context.response.body = {
        error: "Missing required fields: unique_id and privkey are required",
      };
      return;
    }

    try {
      // Fetch the task
      const { data: tasks, error: selectError } = await supabase
        .from("micro_ai_saas")
        .select("*")
        .eq("unique_id", unique_id);

      if (selectError || !tasks || tasks.length === 0) {
        context.response.status = 404;
        context.response.body = { error: "Task not found" };
        return;
      }

      const task = tasks[0];

      // Generate message for signature verification (same as submit_solution)
      const message = await sha256(task.prompt + task.unique_id);

      // Generate signature using the private key
      const wallet = new Wallet(privkey);
      const signature = await wallet.signMessage(message);

      context.response.status = 200;
      context.response.body = {
        message,
        signature,
        signer: wallet.address,
      };
    } catch (err) {
      console.error("Signing error:", err);
      context.response.status = 500;
      context.response.body = { error: "Failed to sign message" };
    }
  })
  .post("/v2/submit_solution", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const {
      unique_id,
      solution,
      optimized_prompt,
      solver,
      solver_type,
      signature,
    } = JSON.parse(payload);

    // Validate required fields
    if (!unique_id || !solution || !solver) {
      context.response.status = 400;
      context.response.body = {
        error:
          "Missing required fields: unique_id, solution, and solver are required",
      };
      return;
    }

    try {
      // Fetch the task
      const { data: tasks, error: selectError } = await supabase
        .from("micro_ai_saas")
        .select("*")
        .eq("unique_id", unique_id);

      if (selectError) {
        console.error("Database error:", selectError);
        context.response.status = 500;
        context.response.body = { error: "Database query failed" };
        return;
      }

      if (!tasks || tasks.length === 0) {
        context.response.status = 404;
        context.response.body = { error: "Task not found" };
        return;
      }

      const task = tasks[0];

      // Generate message for signature verification
      const message = await sha256(task.prompt + task.unique_id);

      // Case 2: Task already has a solution
      if (task.solution) {
        context.response.status = 400;
        context.response.body = {
          error: "Task already has a solution",
          existingSolution: {
            solver: task.solver,
            solvedAt: task.solved_at,
          },
        };
        return;
      }

      // Case 3: Task has a designated solver - verify signature
      if (task.solver) {
        // Signature verification required
        if (!signature) {
          context.response.status = 400;
          context.response.body = {
            error: "Signature is required when task has a designated solver",
            expectedMessage: message,
            hint: "Sign the message (SHA256 hash of prompt + unique_id) with your private key",
          };
          return;
        }

        try {
          // Verify the signature
          const recoveredAddress = verifyMessage(message, signature);

          // Check if recovered address matches the designated solver
          if (recoveredAddress.toLowerCase() !== task.solver.toLowerCase()) {
            context.response.status = 403;
            context.response.body = {
              error:
                "Signature verification failed: You are not the designated solver",
              designatedSolver: task.solver,
              yourAddress: recoveredAddress,
            };
            return;
          }

          // Also check if the solver matches
          if (solver !== task.solver) {
            context.response.status = 403;
            context.response.body = {
              error: "solver does not match the designated solver",
              designatedSolver: task.solver,
            };
            return;
          }
        } catch (err) {
          console.error("Signature verification error:", err);
          context.response.status = 400;
          context.response.body = {
            error: "Invalid signature format or verification failed",
          };
          return;
        }
      }

      // Case 1: Task has no solution and no designated solver - anyone can solve
      // Case 3 (passed verification): Designated solver with valid signature
      // Update the task with the solution
      const updateData: Record<string, any> = {
        solution,
        solver: task.solver || solver, // Use existing solver or set new one
        solved_at: new Date().toISOString(),
        optimized_prompt: optimized_prompt,
      };

      if (solver_type) {
        updateData.solver_type = solver_type;
      }

      const { data, error: updateError } = await supabase
        .from("micro_ai_saas")
        .update(updateData)
        .eq("unique_id", unique_id)
        .select();

      if (updateError) {
        console.error("Database error:", updateError);
        context.response.status = 500;
        context.response.body = { error: "Failed to update task" };
        return;
      }

      // Update coupon if task has one

      if (task.coupon) {
        const { error: couponError } = await supabase
          .from("micro_ai_saas_coupons")
          .update({ if_used: true, owner: solver })
          .eq("addr", task.coupon);

        if (couponError) {
          console.error("Failed to update coupon:", couponError);
          // Note: We don't fail the request if coupon update fails
          // as the solution is already recorded
        }
      }

      context.response.status = 200;
      context.response.body = {
        success: true,
        task: data[0],
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  })
  .post("/v2/vote_agent", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const { privkey, unique_id, vote } = JSON.parse(payload);

    // Validate required fields
    if (!privkey || !unique_id || !vote) {
      context.response.status = 400;
      context.response.body = {
        error:
          "Missing required fields: privkey, unique_id, and vote are required",
      };
      return;
    }

    // Validate vote value
    if (vote !== "up" && vote !== "down") {
      context.response.status = 400;
      context.response.body = {
        error: "Invalid vote value: vote must be either 'up' or 'down'",
      };
      return;
    }

    try {
      // Fetch the task
      const { data: tasks, error: selectError } = await supabase
        .from("micro_ai_saas")
        .select("*")
        .eq("unique_id", unique_id);

      if (selectError) {
        console.error("Database error:", selectError);
        context.response.status = 500;
        context.response.body = { error: "Database query failed" };
        return;
      }

      if (!tasks || tasks.length === 0) {
        context.response.status = 404;
        context.response.body = { error: "Task not found" };
        return;
      }

      const task = tasks[0];

      // Check if task has a coupon
      if (!task.coupon) {
        context.response.status = 400;
        context.response.body = {
          error: "Task does not have a coupon associated",
        };
        return;
      }

      // Check if task has a solver
      if (!task.solver) {
        context.response.status = 400;
        context.response.body = {
          error: "Task does not have a solver yet, cannot vote",
        };
        return;
      }

      // Verify privkey matches the coupon address
      try {
        const wallet = new Wallet(privkey);

        if (wallet.address.toLowerCase() !== task.coupon.toLowerCase()) {
          context.response.status = 403;
          context.response.body = {
            error:
              "Coupon verification failed: Private key does not match the task's coupon",
            expectedCoupon: task.coupon,
            providedAddress: wallet.address,
          };
          return;
        }
      } catch (err) {
        console.error("Wallet creation error:", err);
        context.response.status = 400;
        context.response.body = {
          error: "Invalid private key format",
        };
        return;
      }

      // Fetch the coupon to check if already voted
      const { data: coupons, error: couponSelectError } = await supabase
        .from("micro_ai_saas_coupons")
        .select("*")
        .eq("addr", task.coupon);

      if (couponSelectError || !coupons || coupons.length === 0) {
        context.response.status = 404;
        context.response.body = {
          error: "Coupon not found in database",
        };
        return;
      }

      const coupon = coupons[0];

      // Check if already voted
      if (coupon.if_voted) {
        context.response.status = 400;
        context.response.body = {
          error: "This coupon has already been used to vote",
          previousVote: coupon.vote,
        };
        return;
      }

      // Update the coupon to mark as voted
      const { error: couponUpdateError } = await supabase
        .from("micro_ai_saas_coupons")
        .update({
          if_voted: true,
        })
        .eq("addr", task.coupon);

      if (couponUpdateError) {
        console.error("Failed to update coupon:", couponUpdateError);
        context.response.status = 500;
        context.response.body = { error: "Failed to record vote" };
        return;
      }

      // Fetch the agent/solver to update vote count
      const { data: agents, error: agentSelectError } = await supabase
        .from("micro_ai_saas_agents")
        .select("*")
        .eq("unique_id", task.solver);

      if (agentSelectError) {
        console.error("Failed to fetch agent:", agentSelectError);
        // Continue anyway - vote is recorded on coupon
      }

      // Update agent vote count if agent exists
      if (agents && agents.length > 0) {
        const agent = agents[0];
        const updateField = vote === "up" ? "up_votes" : "down_votes";
        const currentCount = agent[updateField] || 0;

        const { error: agentUpdateError } = await supabase
          .from("micro_ai_saas_agents")
          .update({
            [updateField]: currentCount + 1,
          })
          .eq("unique_id", task.solver);

        if (agentUpdateError) {
          console.error("Failed to update agent vote count:", agentUpdateError);
          // Continue anyway - vote is recorded on coupon
        }
      }

      context.response.status = 200;
      context.response.body = {
        success: true,
        vote: vote,
        solver: task.solver,
        message: `Successfully voted ${vote} for agent`,
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  })
  .post("/v2/review_solution", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const { unique_id, review, privkey } = JSON.parse(payload);

    // Validate required fields
    if (!unique_id || !review || !privkey) {
      context.response.status = 400;
      context.response.body = {
        error:
          "Missing required fields: unique_id, review, and privkey are required",
      };
      return;
    }

    try {
      // Fetch the task
      const { data: tasks, error: selectError } = await supabase
        .from("micro_ai_saas")
        .select("*")
        .eq("unique_id", unique_id);

      if (selectError) {
        console.error("Database error:", selectError);
        context.response.status = 500;
        context.response.body = { error: "Database query failed" };
        return;
      }

      if (!tasks || tasks.length === 0) {
        context.response.status = 404;
        context.response.body = { error: "Task not found" };
        return;
      }

      const task = tasks[0];

      // Check if task is already reviewed
      if (task.review) {
        context.response.status = 400;
        context.response.body = {
          error: "Task is already reviewed",
          existingReview: task.review,
          reviewedAt: task.reviewed_at,
        };
        return;
      }

      // Verify that the privkey corresponds to the task's coupon
      if (!task.coupon) {
        context.response.status = 400;
        context.response.body = {
          error: "Task does not have a coupon associated",
        };
        return;
      }

      try {
        // Create wallet from privkey and verify it matches the coupon address
        const wallet = new Wallet(privkey);

        if (wallet.address.toLowerCase() !== task.coupon.toLowerCase()) {
          context.response.status = 403;
          context.response.body = {
            error:
              "Coupon verification failed: Private key does not match the task's coupon",
            expectedCoupon: task.coupon,
            providedAddress: wallet.address,
          };
          return;
        }
      } catch (err) {
        console.error("Wallet creation error:", err);
        context.response.status = 400;
        context.response.body = {
          error: "Invalid private key format",
        };
        return;
      }

      // All verification passed, update the task review
      const { data: updatedTask, error: updateError } = await supabase
        .from("micro_ai_saas")
        .update({
          review: review,
        })
        .eq("unique_id", unique_id)
        .select();

      if (updateError) {
        console.error("Database error:", updateError);
        context.response.status = 500;
        context.response.body = { error: "Failed to update review" };
        return;
      }

      // Update coupon if task has one
      if (task.coupon) {
        const { error: couponError } = await supabase
          .from("micro_ai_saas_coupons")
          .update({ if_reviewed: true })
          .eq("addr", task.coupon);

        if (couponError) {
          console.error("Failed to update coupon:", couponError);
          // Note: We don't fail the request if coupon update fails
          // as the review is already recorded
        }
      }

      context.response.status = 200;
      context.response.body = {
        success: true,
        task: updatedTask[0],
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
    }
  })
  .post("/v2/generate_coupon", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL_2") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY_2") ?? ""
    );

    // Parse the request body
    let payload = await context.request.body.text();
    const { password } = JSON.parse(payload);

    // Verify admin password
    if (!(await verifyAdminPassword(context, password))) {
      return;
    }

    try {
      // Generate a new Ethereum wallet (private key and address)
      const wallet = Wallet.createRandom();
      const privateKey = wallet.privateKey;
      const address = wallet.address;

      // Insert the coupon into the database
      const { data, error } = await supabase
        .from("micro_ai_saas_coupons")
        .insert([
          {
            priv: privateKey,
            addr: address,
          },
        ])
        .select();

      if (error) {
        console.error("Database error:", error);
        context.response.status = 500;
        context.response.body = { error: error.message };
        return;
      }

      // Return the generated coupon
      context.response.status = 201;
      context.response.body = {
        coupon: address,
        privateKey: privateKey,
        createdAt: data[0].created_at,
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      context.response.status = 500;
      context.response.body = { error: "Failed to generate coupon" };
    }
  })
  .get("/tasks", async (context) => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let { data: tasks, error } = await supabase
      .from("micro_ai_saas")
      .select("*");

    if (error) {
      context.response.status = 500;
      context.response.body = { error: error.message };
      return;
    }

    context.response.body = tasks;
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
  .get("/task", async (context) => {
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
      .match({ unique_id });
    //   .or('solution.is.null,solution.eq.')

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
    const { unique_id, solution, solver, solver_type } = JSON.parse(payload);
    // solver_type is an array of strings representing the types of solvers

    // Validate required fields
    if (!unique_id || !solution || !solver) {
      context.response.status = 400;
      context.response.body = {
        error:
          "Missing required fields: unique_id, solution, and solver are required",
      };
      return;
    }

    let { data: micro_ai_saas, error: selectError } = await supabase
      .from("micro_ai_saas")
      .select("*")
      .match({ unique_id })
      .or("solution.is.null,solution.eq.");

    // Check if task exists and has no solution
    if (!micro_ai_saas || micro_ai_saas.length === 0) {
      context.response.status = 400;
      context.response.body = {
        error: "Task not found or solution already exists",
      };
      return;
    }

    // Update task
    const { data, error } = await supabase
      .from("micro_ai_saas")
      .update({
        solution,
        solver,
        ...(solver_type && { solver_type }),
        solved_at: new Date().toISOString(),
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
