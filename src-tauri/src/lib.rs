/* src-tauri/src/lib.rs */

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::Emitter;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle();

            // --- 1. メニューの構築 ---

            // A. アプリケーションメニュー
            let app_menu = Submenu::with_items(
                handle,
                "kakukoto.",
                true,
                &[
                    &PredefinedMenuItem::about(handle, Some("kakukoto.について"), None)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::services(handle, Some("サービス設定"))?,
                    &PredefinedMenuItem::hide(handle, Some("kakukoto.を隠す"))?,
                    &PredefinedMenuItem::hide_others(handle, Some("ほかを隠す"))?,
                    &PredefinedMenuItem::show_all(handle, Some("すべて表示"))?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::quit(handle, Some("kakukoto.を終了"))?,
                ],
            )?;

            // B. ファイルメニュー
            let new_i = MenuItem::with_id(handle, "new", "新規作成", true, Some("CmdOrCtrl+N"))?;
            let open_i = MenuItem::with_id(handle, "open", "開く", true, Some("CmdOrCtrl+O"))?;
            let save_i = MenuItem::with_id(handle, "save", "保存", true, Some("CmdOrCtrl+S"))?;
            let save_as_i = MenuItem::with_id(handle, "save_as", "名前を付けて保存", true, Some("CmdOrCtrl+Shift+S"))?;

            let file_menu = Submenu::with_items(
                handle,
                "ファイル",
                true,
                &[
                    &new_i,
                    &open_i,
                    &save_i,
                    &save_as_i,
                ],
            )?;

            // C. 編集メニュー
            let edit_menu = Submenu::with_items(
                handle,
                "編集",
                true,
                &[
                    &PredefinedMenuItem::undo(handle, Some("元に戻す"))?,
                    &PredefinedMenuItem::redo(handle, Some("やり直し"))?,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::cut(handle, Some("切り取り"))?,
                    &PredefinedMenuItem::copy(handle, Some("コピー"))?,
                    &PredefinedMenuItem::paste(handle, Some("貼り付け"))?,
                    &PredefinedMenuItem::select_all(handle, Some("すべて選択"))?,
                ],
            )?;

            // D. モード切り替え
            let mode_kakukoto = MenuItem::with_id(handle, "mode_kakukoto", "kakukoto", true, Some("CmdOrCtrl+Shift+E"))?;
            let mode_kakuyomu = MenuItem::with_id(handle, "mode_kakuyomu", "kakuyomu", true, Some("CmdOrCtrl+Shift+B"))?;
            let mode_yomukoto = MenuItem::with_id(handle, "mode_yomukoto", "yomukoto", true, Some("CmdOrCtrl+Shift+P"))?;
            let mode_focus = MenuItem::with_id(handle, "mode_focus", ".zone", true, Some("CmdOrCtrl+Shift+L"))?;

            let view_menu = Submenu::with_items(
                handle,
                "モード",
                true,
                &[
                    &mode_kakukoto,
                    &mode_kakuyomu,
                    &mode_yomukoto,
                    &PredefinedMenuItem::separator(handle)?,
                    &mode_focus,
                ]
            )?;

            // E. ウィンドウメニュー
            let maximize_i = MenuItem::with_id(handle, "maximize", "最大化", true, None::<&str>)?;

            let window_menu = Submenu::with_items(
                handle,
                "ウィンドウ",
                true,
                &[
                    &PredefinedMenuItem::minimize(handle, Some("最小化"))?,
                    &maximize_i,
                    &PredefinedMenuItem::separator(handle)?,
                    &PredefinedMenuItem::close_window(handle, Some("ウィンドウを閉じる"))?,
                ],
            )?;

            // メニューをセット
            let menu = Menu::with_items(handle, &[
                &app_menu,
                &file_menu,
                &edit_menu,
                &view_menu,
                &window_menu
            ])?;
            app.set_menu(menu)?;

            // --- 2. イベントハンドリング ---
            app.on_menu_event(move |app, event| {
                let event_name = event.id().as_ref();
                match event_name {
                    // ファイル操作
                    "new" => { let _ = app.emit("menu-new", ()); }
                    "open" => { let _ = app.emit("menu-open", ()); }
                    "save" => { let _ = app.emit("menu-save", ()); }
                    "save_as" => { let _ = app.emit("menu-save-as", ()); }
                    
                    // モード操作
                    "mode_kakukoto" => { let _ = app.emit("menu-mode-change", "kakukoto"); }
                    "mode_kakuyomu" => { let _ = app.emit("menu-mode-change", "kakuyomu"); }
                    "mode_yomukoto" => { let _ = app.emit("menu-mode-change", "yomukoto"); }
                    "mode_focus" => { let _ = app.emit("menu-mode-focus", ()); }

                    // ウィンドウ操作
                    "maximize" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.maximize();
                        }
                    }
                    _ => {}
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}