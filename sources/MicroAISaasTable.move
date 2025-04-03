module MicroAISaas::MicroAISaasTable {
    use std::vector;
    use std::string;
    use std::option;
    use std::signer;
    use aptos_framework::table;


    struct MicroAISaas has key, store {
        id: u64,
        user: option::Option<string::String>,
        prompt: option::Option<string::String>,
        task_type: string::String,
        solution: option::Option<string::String>,
        solver: option::Option<string::String>,
        fee: u64,
        fee_unit: string::String,
        tx: string::String,
        created_at: u64, 
        solved_at: option::Option<u64>,
        signature: option::Option<string::String>,
        unique_id: vector<u8>,
        solver_type: vector<string::String>,
    }


    struct MicroAISaasTable has key, store {
        table: table::Table<u64, MicroAISaas>,
    }


    public entry fun init_micro_ai_saas_table(account: &signer) {
        let table = table::new<u64, MicroAISaas>();
        move_to(account, MicroAISaasTable { table });
    }

    public entry fun insert_task(
        account: &signer,
        id: u64,
        user: option::Option<string::String>,
        prompt: option::Option<string::String>,
        task_type: string::String,
        solution: option::Option<string::String>,
        solver: option::Option<string::String>,
        fee: u64,
        fee_unit: string::String,
        tx: string::String,
        created_at: u64,
        solved_at: option::Option<u64>,
        signature: option::Option<string::String>,
        unique_id: vector<u8>,
        solver_type: vector<string::String>
    ) {
        let table_ref = &mut borrow_global_mut<MicroAISaasTable>(signer::address_of(account)).table;
        let task = MicroAISaas {
            id,
            user,
            prompt,
            task_type,
            solution,
            solver,
            fee,
            fee_unit,
            tx,
            created_at,
            solved_at,
            signature,
            unique_id,
            solver_type,
        };
        table::add(table_ref, id, task);
    }

    
    public fun get_task(account: &signer, id: u64): option::Option<MicroAISaas> {
        let table_ref = &borrow_global<MicroAISaasTable>(signer::address_of(account)).table;
        let task_ref = table::borrow(table_ref, id);
        option::some(*task_ref)
    }
}
