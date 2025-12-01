// theme_apply.rs
use std::path::Path;
use std::process::Command;

/// 主题应用模块
pub struct ThemeApplier;

impl ThemeApplier {
    /// 直接运行主题文件（后台运行，不显示窗口）- 主要方法
    pub fn apply_theme_by_path(theme_path: &str) -> Result<(), String> {
        println!("正在后台应用主题: {}", theme_path);

        // 验证主题文件是否存在
        if !Path::new(theme_path).exists() {
            return Err(format!("主题文件不存在: {}", theme_path));
        }

        // 验证文件扩展名
        if !theme_path.to_lowercase().ends_with(".theme") {
            return Err("文件不是有效的主题文件 (.theme)".to_string());
        }

        // 方法1: 使用 start /b 在后台运行主题文件
        let result = Command::new("cmd")
            .args(&["/C", "start", "/b", "", theme_path])
            .status();

        match result {
            Ok(status) if status.success() => {
                println!("主题应用命令执行成功（后台运行）");
                Ok(())
            }
            Ok(status) => Err(format!("执行主题应用命令失败，退出码: {:?}", status.code())),
            Err(e) => {
                // 如果 start /b 失败，尝试其他方法
                println!("start /b 方法失败，尝试替代方法: {}", e);
                Self::apply_theme_alternative(theme_path)
            }
        }
    }

    /// 替代方法：使用 PowerShell 隐藏窗口
    pub fn apply_theme_alternative(theme_path: &str) -> Result<(), String> {
        println!("尝试使用 PowerShell 方法应用主题: {}", theme_path);
        let _ = Self::apply_theme_via_registry(theme_path);
        // 方法2: 使用 PowerShell 的 Start-Process 隐藏窗口
        let status = Command::new("powershell")
            .args(&[
                "-Command",
                "Start-Process",
                "-FilePath",
                theme_path,
                "-WindowStyle",
                "Hidden",
            ])
            .status()
            .map_err(|e| format!("执行 PowerShell 命令失败: {}", e))?;

        if status.success() {
            println!("主题静默应用成功");
            Ok(())
        } else {
            // 如果 PowerShell 也失败，尝试最基础的 cmd 方法
            println!("PowerShell 方法失败，尝试基础 cmd 方法");
            Self::apply_theme_fallback(theme_path)
        }
    }

    /// 回退方法：使用最基础的 cmd 命令
    fn apply_theme_fallback(theme_path: &str) -> Result<(), String> {
        println!("使用基础 cmd 方法应用主题: {}", theme_path);

        // 方法3: 直接使用 cmd 运行（可能会显示窗口，但确保能工作）
        let status = Command::new("cmd")
            .args(&["/C", theme_path])
            .status()
            .map_err(|e| format!("执行基础命令失败: {}", e))?;

        if status.success() {
            println!("主题应用成功（可能显示了窗口）");
            Ok(())
        } else {
            Err("所有应用主题的方法都失败了".to_string())
        }
    }

    /// 通过注册表直接设置主题（最静默的方法）
    pub fn apply_theme_via_registry(theme_path: &str) -> Result<(), String> {
        use winreg::enums::*;
        use winreg::RegKey;

        println!("通过注册表应用主题: {}", theme_path);

        if !Path::new(theme_path).exists() {
            return Err(format!("主题文件不存在: {}", theme_path));
        }

        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let themes_key = hkcu
            .open_subkey_with_flags(
                "Software\\Microsoft\\Windows\\CurrentVersion\\Themes",
                KEY_WRITE,
            )
            .map_err(|e| format!("无法打开注册表键: {}", e))?;

        // 设置当前主题
        themes_key
            .set_value("CurrentTheme", &theme_path.to_string())
            .map_err(|e| format!("无法设置 CurrentTheme: {}", e))?;

        // 设置 ThemeMRU（最近使用的主题）
        let theme_mru = format!("{};", theme_path);
        themes_key
            .set_value("ThemeMRU", &theme_mru)
            .map_err(|e| format!("无法设置 ThemeMRU: {}", e))?;

        println!("注册表设置成功，主题将在下次登录或系统刷新时生效");
        Ok(())
    }
}
