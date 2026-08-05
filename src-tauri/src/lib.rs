use std::process::Command;


#[tauri::command]
fn get_services() -> String {

    let output = Command::new("/opt/homebrew/bin/brew")
        .args([
            "services",
            "list"
        ])
        .output();


    match output {

        Ok(result) => {
            String::from_utf8_lossy(
                &result.stdout
            ).to_string()
        }

        Err(e) => {
            format!("Error: {}", e)
        }

    }
}



#[tauri::command]
fn service_action(
    service: String,
    action: String
) -> String {

    let output = Command::new("/opt/homebrew/bin/brew")
        .args([
            "services",
            &action,
            &service
        ])
        .output();


    match output {

        Ok(result) => {
            String::from_utf8_lossy(
                &result.stdout
            ).to_string()
        }

        Err(e) => {
            format!("Error: {}", e)
        }

    }
}



#[tauri::command]
fn open_php_folder(path: String) -> String {
    let output = Command::new("/usr/bin/open")
        .args([&path])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                "ok".to_string()
            } else {
                String::from_utf8_lossy(&result.stderr).to_string()
            }
        }
        Err(e) => format!("Error: {}", e),
    }
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()

        .invoke_handler(
            tauri::generate_handler![
                get_services,
                get_service_ports,
                service_action,
                open_php_folder
            ]
        )

        .plugin(
            tauri_plugin_shell::init()
        )

        .setup(|app| {

            if cfg!(debug_assertions) {

                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Info)
                    .build(),
                )?;

            }

            Ok(())

        })

        .run(
            tauri::generate_context!()
        )
        .expect("error while running tauri application");

}

#[tauri::command]
fn get_service_ports() -> String {

    let output = Command::new("/usr/sbin/lsof")
        .args([
            "-nP",
            "-iTCP",
            "-sTCP:LISTEN"
        ])
        .output();


    match output {

        Ok(result) => {
            String::from_utf8_lossy(
                &result.stdout
            ).to_string()
        }

        Err(e) => {
            format!("Error: {}", e)
        }

    }
}