import React from 'react';
import { useLocalImageUrl } from '../mod/utils/tauri-file';

const DEFAULT_LIGHT = 'https://gw.alipayobjects.com/zos/bmw-prod/f601048d-61c2-44d0-bf57-ca1afe7fd92e.svg';

type ThemeThumbProps = {
  wallpaperPath?: string;
  fallback?: string; // 可选：若不传使用默认图
};

function ThemeThumbInner({ wallpaperPath, fallback }: ThemeThumbProps) {
  const { src } = useLocalImageUrl(wallpaperPath);
  const final = src || fallback || DEFAULT_LIGHT;

  return (
    <img
      src={final}
      alt=""
      style={{ width: 120, height: 80, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'block' }}
      draggable={false}
    />
  );
}

// memo：只有当 wallpaperPath 或 fallback 改变时才重新渲染
export const ThemeThumb = React.memo(ThemeThumbInner, (prev, next) => {
  return prev.wallpaperPath === next.wallpaperPath && prev.fallback === next.fallback;
});
