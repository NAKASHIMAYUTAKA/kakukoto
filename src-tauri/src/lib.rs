/* src-tauri/src/lib.rs */

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::Emitter;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();

            // --- 1. メニューの構築 ---
            
            // ファイルメニュー
            let new_i = MenuItem::with_id(handle, "new", "新規作成", true, Some("CmdOrCtrl+N"))?;
            let open_i = MenuItem::with_id(handle, "open", "開く", true, Some("CmdOrCtrl+O"))?;
            let save_i = MenuItem::with_id(handle, "save", "保存", true, Some("CmdOrCtrl+S"))?;
            let save_as_i = MenuItem::with_id(handle, "save_as", "名前を付けて保存", true, Some("CmdOrCtrl+Shift+S"))?;
            let quit_i = PredefinedMenuItem::quit(handle, Some("終了"))?;

            let file_menu = Submenu::with_items(
                handle,
                "ファイル",
                true,
                &[
                    &new_i,
                    &open_i,
                    &save_i,
                    &save_as_i,
                    &PredefinedMenuItem::separator(handle)?,
                    &quit_i,
                ],
            )?;

            // 編集メニュー
            let undo_i = PredefinedMenuItem::undo(handle, Some("元に戻す"))?;
            let redo_i = PredefinedMenuItem::redo(handle, Some("やり直し"))?;
            let cut_i = PredefinedMenuItem::cut(handle, Some("切り取り"))?;
            let copy_i = PredefinedMenuItem::copy(handle, Some("コピー"))?;
            let paste_i = PredefinedMenuItem::paste(handle, Some("貼り付け"))?;
            let select_all_i = PredefinedMenuItem::select_all(handle, Some("すべて選択"))?;            
            
            let edit_menu = Submenu::with_items(
                handle,
                "編集",
                true,
                &[
                    &undo_i,
                    &redo_i,
                    &PredefinedMenuItem::separator(handle)?,
                    &cut_i,
                    &copy_i,
                    &paste_i,
                    &select_all_i,
                ],
            )?;

            let menu = Menu::with_items(handle, &[&file_menu, &edit_menu])?;
            app.set_menu(menu)?;

            // --- 2. イベントハンドリング ---
            app.on_menu_event(move |app, event| {
                let event_name = event.id().as_ref();
                match event_name {
                    "new" => { let _ = app.emit("menu-new", ()); }
                    "open" => { let _ = app.emit("menu-open", ()); }
                    "save" => { let _ = app.emit("menu-save", ()); }
                    "save_as" => { let _ = app.emit("menu-save-as", ()); }
                    _ => {}
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}