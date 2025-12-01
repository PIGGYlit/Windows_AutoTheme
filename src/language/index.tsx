import { Button, Dropdown } from "antd";
import type { AppDataType } from '../Type';
import { useEffect, useState } from "react";
import { ItemType } from "antd/es/menu/interface";

interface LanguageItem {
  key: string;
  label: string;
}

// 语言菜单项
export const languageItems: LanguageItem[] = [
  { key: 'zh_CN', label: "简体中文" },
  { key: 'zh_HK', label: "繁体中文" },
  { key: 'en', label: "English" },
  { key: 'es', label: "Español" },
  { key: 'ja', label: "日本語" },
  { key: 'ru', label: "Russian" },
];

// 支持的语言代码列表
const SUPPORTED_LANGUAGES = languageItems.map(item => item.key);

// 语言包加载器
const localeLoaders: Record<string, () => Promise<{ default: any }>> = {
  'zh_CN': () => import('./zh-CN.json'),
  'zh_HK': () => import('./zh-HK.json'),
  'en': () => import('./en.json'),
  'es': () => import('./es-ES.json'),
  'ja': () => import('./ja-JP.json'),
  'ru': () => import('./ru.json'),
};

const DEFAULT_LANGUAGE = 'en';

interface Props {
  AppData?: AppDataType;
  setData: (update: Partial<AppDataType>) => void;
}

const Language = ({ AppData, setData }: Props) => {
  // 获取系统语言
  const getSystemLanguage = (): string => {
    try {
      const systemLang = navigator.language;
      
      // 直接检查是否在支持的语言列表中
      if (SUPPORTED_LANGUAGES.includes(systemLang)) {
        return systemLang;
      }
      
      // 尝试提取语言代码（如从 "zh-CN" 中提取 "zh"）
      const langCode = systemLang.split('-')[0];
      if (SUPPORTED_LANGUAGES.includes(langCode)) {
        return langCode;
      }
      
      // 尝试将分隔符从 "-" 转换为 "_"
      const normalizedLang = systemLang.replace('-', '_');
      if (SUPPORTED_LANGUAGES.includes(normalizedLang)) {
        return normalizedLang;
      }
      
      return DEFAULT_LANGUAGE;
    } catch (error) {
      console.warn('Failed to detect system language, using default:', error);
      return DEFAULT_LANGUAGE;
    }
  };

  // 使用状态来跟踪当前语言，确保在检测到系统语言后立即更新
  const [currentLang, setCurrentLang] = useState<string>(AppData?.language || getSystemLanguage());
  const [locale, setLocale] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 初始化语言设置
  useEffect(() => {
    // 如果 AppData 中没有语言设置，设置系统语言
    if (!AppData?.language && !initialized) {
      const systemLang = getSystemLanguage();
      setData({ language: systemLang });
      setCurrentLang(systemLang);
      setInitialized(true);
    } else if (AppData?.language && AppData.language !== currentLang) {
      // 如果 AppData 中的语言与当前状态不同，更新状态
      setCurrentLang(AppData.language);
    }
  }, [AppData?.language, initialized, setData, currentLang]);

  // 异步加载语言包
  useEffect(() => {
    const loadLocale = async () => {
      setLoading(true);
      try {
        const loader = localeLoaders[currentLang] || localeLoaders[DEFAULT_LANGUAGE];
        const mod = await loader();
        setLocale(mod.default);
      } catch (error) {
        console.error(`Failed to load locale for ${currentLang}:`, error);
        // 回退到默认语言
        try {
          const fallbackLoader = localeLoaders[DEFAULT_LANGUAGE];
          const mod = await fallbackLoader();
          setLocale(mod.default);
        } catch (fallbackError) {
          console.error('Failed to load fallback locale:', fallbackError);
          setLocale({}); // 设置空对象避免崩溃
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentLang) {
      loadLocale();
    }
  }, [currentLang]);

  // 获取当前语言标签
  const currentLabel = languageItems.find(item => item.key === currentLang)?.label 
    || languageItems.find(item => item.key === DEFAULT_LANGUAGE)?.label 
    || 'English';

  return {
    Language: (
      <Dropdown
        menu={{
          items: languageItems as ItemType[],
          onClick: ({ key }) => {
            setData({ language: key });
            setCurrentLang(key);
          },
          disabled: loading
        }}
        placement="bottom"
        arrow
        disabled={loading}
      >
        <Button 
          color="default" 
          variant="filled"
          loading={loading}
        >
          {loading ? 'Loading...' : currentLabel}
        </Button>
      </Dropdown>
    ),
    locale,
    currentLang,
    loading
  };
};

export default Language;