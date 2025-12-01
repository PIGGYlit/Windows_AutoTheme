import { invoke } from "@tauri-apps/api/core";
import { Theme } from "../com/ThemeSelector";

// 应用主题（只需要路径）
let timer: any = null
export async function applyTheme(themePath: string) {
    try {
        clearTimeout(timer)
        timer = setTimeout(async () => {
            const themesData = (await invoke('get_windows_themes')) as Theme[];
            // 找到匹配的主题
            const theme = themesData.find(t => t.path === themePath);
             if(theme?.is_active) return
            await invoke('apply_theme', { themePath });
            console.log('主题应用成功');
        }, 1000);
        return true;
    } catch (error) {
        console.error('应用主题失败:', error);
        throw error;
    }
}
