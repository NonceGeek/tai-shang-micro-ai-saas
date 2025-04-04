#[test_only]

module micro_ai_saas::micro_ai_tests;

use sui::test_scenario;
use std::string::String;
use micro_ai_saas::micro_ai::create_micro_ai_saas;
use micro_ai_saas::micro_ai::get_details;

// 辅助函数：创建一个 TxContext 对象
// fun create_ctx(): TxContext {
//     let ctx = test_scenario::dummy_tx_context();
//     ctx
// }

// 测试用例：创建 MicroAISaaS 对象
#[test]
public fun test_create_micro_ai_saas() {
    // let ctx = create_ctx();
    let user = option::some(b"test_user");
    let prompt = option::some(b"test_prompt");
    let task_type = b"llm";
    let solution = option::some(b"test_solution");
    let solver = option::some(b"test_solver");
    let fee = 100;
    let fee_unit = b"ldg".to_string();
    let tx = b"test_tx".to_string();
    let solved_at = option::none<u64>();
    let signature = option::some(b"test_signature");
    let unique_id = vector::singleton<u8>(1);
    let solver_type = vector::singleton<u8>(2);

    let saas = create_micro_ai_saas(
        user,
        prompt,
        task_type,
        solution,
        solver,
        fee,
        fee_unit,
        tx,
        solved_at,
        signature,
        unique_id,
        solver_type,
        &mut ctx
    );

    let (user_opt, prompt_opt, task_type_str, solution_opt, solver_opt, fee_u64, fee_unit_str, tx_str, created_at_u64, solved_at_opt, signature_opt, unique_id_vec, solver_type_vec) = get_details(&saas);

    assert!(option::contains(&user_opt, b"test_user"), 0);
    assert!(option::contains(&prompt_opt, &String::utf8(vector::from_bytes(b"test_prompt"))), 1);
    assert!(string::equal(&task_type_str, &String::utf8(vector::from_bytes(b"llm"))), 2);
    assert!(option::contains(&solution_opt, &String::utf8(vector::from_bytes(b"test_solution"))), 3);
    assert!(option::contains(&solver_opt, &String::utf8(vector::from_bytes(b"test_solver"))), 4);
    assert!(fee_u64 == 100, 5);
    assert!(string::equal(&fee_unit_str, &String::utf8(vector::from_bytes(b"ldg"))), 6);
    assert!(string::equal(&tx_str, &String::utf8(vector::from_bytes(b"test_tx"))), 7);
    assert!(created_at_u64 > 0, 8); // 确保 created_at 是一个有效的时间戳
    assert!(option::is_none(&solved_at_opt), 9);
    assert!(option::contains(&signature_opt, &String::utf8(vector::from_bytes(b"test_signature"))), 10);
    assert!(vector::length(&unique_id_vec) == 1 && vector::borrow(&unique_id_vec, 0) == 1, 11);
    assert!(vector::length(&solver_type_vec) == 1 && vector::borrow(&solver_type_vec, 0) == 2, 12);
}

// 测试用例：更新解决时间
// #[test]
// public fun test_update_solved_at() {
//     let ctx = create_ctx();
//     let user = option::some(String::utf8(b"test_user"));
//     let prompt = option::some(String::utf8(b"test_prompt"));
//     let task_type = String::utf8(b"llm");
//     let solution = option::some(String::utf8(b"test_solution"));
//     let solver = option::some(String::utf8(b"test_solver"));
//     let fee = 100;
//     let fee_unit = String::utf8(b"ldg");
//     let tx = String::utf8(b"test_tx");
//     let solved_at = option::none<u64>();
//     let signature = option::some(String::utf8(b"test_signature"));
//     let unique_id = vector::singleton<u8>(1);
//     let solver_type = vector::singleton<u8>(2);

//     let mut saas = create_micro_ai_saas(
//         user,
//         prompt,
//         task_type,
//         solution,
//         solver,
//         fee,
//         fee_unit,
//         tx,
//         solved_at,
//         signature,
//         unique_id,
//         solver_type,
//         &mut ctx
//     );

//     let new_solved_at = 1672531200; // 示例时间戳
//     update_solved_at(&mut saas, new_solved_at);

//     let (_, _, _, _, _, _, _, _, _, solved_at_opt, _, _, _) = get_details(&saas);

//     assert!(option::contains(&solved_at_opt, &new_solved_at), 13);
// }