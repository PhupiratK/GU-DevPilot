import { invoke } from "@tauri-apps/api/core";


export async function serviceAction(
    service:string,
    action:string
){

    return await invoke<string>(
        "service_action",
        {
            service,
            action
        }
    );

}


export async function getServices(){

    return await invoke<string>(
        "get_services"
    );

}