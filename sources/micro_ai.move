module micro_ai_saas::micro_ai;
    
    use std::string::String;

    // 定义 MicroAISaaS 资源结构
    public struct MicroAISaaS has key {
        id: UID, // 唯一标识符
        user: Option<String>, // 用户名
        prompt: Option<String>, // 提示
        task_type: String, // 任务类型，默认值为 "llm"
        solution: Option<String>, // 解决方案
        solver: Option<String>, // 求解器
        fee: u64, // 费用，默认值为 0
        fee_unit: String, // 费用单位，默认值为 "ldg"
        tx: String, // 交易信息，默认值为空字符串
        created_at: u64, // 创建时间（使用时间戳）
        solved_at: Option<u64>, // 解决时间，默认为空
        signature: Option<String>, // 签名
        unique_id: vector<u8>, // 唯一 ID（UUID），默认值由系统生成
        solver_type: vector<u8>, // 求解器类型，默认值为空 JSONB
    }

    // 初始化一个新的 MicroAISaaS 对象
    public fun create_micro_ai_saas(
        user: Option<String>,
        prompt: Option<String>,
        task_type: String,
        solution: Option<String>,
        solver: Option<String>,
        fee: u64,
        fee_unit: String,
        tx: String,
        solved_at: Option<u64>,
        signature: Option<String>,
        unique_id: vector<u8>,
        solver_type: vector<u8>,
        ctx: &mut TxContext,
    ): MicroAISaaS {
        let current_time = tx_context::epoch(ctx); // 获取当前时间戳

        MicroAISaaS {
            id: object::new(ctx), // 自动生成唯一对象 ID
            user,
            prompt,
            task_type,
            solution,
            solver,
            fee,
            fee_unit,
            tx,
            created_at: current_time,
            solved_at,
            signature,
            unique_id,
            solver_type,
        }
    }

    // 更新解决时间
    public fun update_solved_at(saas: &mut MicroAISaaS, solved_at: u64) {
        saas.solved_at = option::some(solved_at);
    }

    // 查询 MicroAISaaS 的详细信息
    public fun get_details(saas: &MicroAISaaS): (Option<String>, Option<String>, String, Option<String>, Option<String>, u64, String, String, u64, Option<u64>, Option<String>, vector<u8>, vector<u8>) {
        (
            saas.user,
            saas.prompt,
            saas.task_type,
            saas.solution,
            saas.solver,
            saas.fee,
            saas.fee_unit,
            saas.tx,
            saas.created_at,
            saas.solved_at,
            saas.signature,
            saas.unique_id,
            saas.solver_type,
        )
    }

    // 将 MicroAISaaS 对象转移到另一个账户
    // public fun transfer_ownership(saas: MicroAISaaS, recipient: address, ctx: &mut TxContext) {
    //     transfer::public_transfer(saas, recipient, ctx);
    // }