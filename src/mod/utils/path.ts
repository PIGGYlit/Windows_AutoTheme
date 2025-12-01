// utils/path.ts
export function normalizeWindowsPath(path?: string): string {
  if (!path) return '';

  // 保持原始字符串不被意外修改
  let p = path;

  // 处理 \\?\UNC\server\share\... -> \\server\share\...
  const prefixUNC = '\\\\?\\UNC\\';
  if (p.startsWith(prefixUNC)) {
    const rest = p.slice(prefixUNC.length); // server\share\...
    return '\\\\' + rest;
  }

  // 处理 \\?\C:\...  -> C:\...
  const prefixExtended = '\\\\?\\';
  if (p.startsWith(prefixExtended)) {
    return p.slice(prefixExtended.length);
  }

  // 处理 ?\C:\...  -> C:\...
  const prefixQuestion = '?\\';
  if (p.startsWith(prefixQuestion)) {
    return p.slice(prefixQuestion.length);
  }

  // 如果已经是正常路径，直接返回
  return p;
}

/**
 * 把 Windows 路径转换为 file:// URL，适用于 <img src="...">。
 * - 本地驱动器路径: C:\a\b -> file:///C:/a/b
 * - UNC 路径: \\server\share\a\b -> file://server/share/a/b
 */
export function windowsPathToFileUrl(path?: string): string {
  const norm = normalizeWindowsPath(path);
  if (!norm) return '';

  // 如果是 UNC 路径（以两个反斜杠开头）
  if (norm.startsWith('\\\\')) {
    // 移除开头的两个反斜杠，再把反斜杠转为斜杠
    const withoutSlashes = norm.replace(/^\\\\+/, '');
    const posix = withoutSlashes.replace(/\\/g, '/');
    // 使用 file://server/share/...
    return 'file://' + encodeURI(posix);
  }

  // 驱动器路径 C:\...
  // 转为 file:///C:/...
  const posix = norm.replace(/\\/g, '/');
  // encodeURI 保留斜杠但对空格及非 ASCII 做编码
  return 'file:///' + encodeURI(posix);
}

/**
 * 便利函数：接受 Theme 对象并返回拷贝，且规范化 wallpaper / displayWallpaper 字段
 */
export interface Theme {
  name: string;
  path: string;
  is_active: boolean;
  wallpaper?: string;
  system_mode?: string;
  app_mode?: string;
  displayPath?: string;
  displayWallpaper?: string;
}

export function normalizeThemePaths(theme: Theme): Theme {
  return {
    ...theme,
    wallpaper: normalizeWindowsPath(theme.wallpaper),
    displayWallpaper: normalizeWindowsPath(theme.displayWallpaper),
    // 你也可以同时规范 displayPath 或 path，如果需要就解除注释：
    // displayPath: normalizeWindowsPath(theme.displayPath),
    // path: normalizeWindowsPath(theme.path),
  };
}
