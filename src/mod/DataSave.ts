// src/hooks/useAppData.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppDataType, RatingPromptType } from "../Type";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { isWin11 } from "./ThemeConfig";
const SystemStart = await isEnabled();

// 深度合并函数
const deepMerge = (defaults: any, stored: any): any => {
  if (typeof stored !== 'object' || stored === null) {
    return stored !== undefined ? stored : defaults;
  }

  if (Array.isArray(stored)) {
    return stored;
  }

  const merged = { ...defaults };
  for (const key of Object.keys(stored)) {
    if (Object.prototype.hasOwnProperty.call(stored, key)) {
      if (
        typeof stored[key] === 'object' &&
        stored[key] !== null &&
        !Array.isArray(stored[key])
      ) {
        merged[key] = deepMerge(defaults[key], stored[key]);
      } else {
        merged[key] = stored[key];
      }
    }
  }
  return merged;
};
// 默认评分提示状态
const defaultRatingPrompt: RatingPromptType = {
  lastPromptTime: 0,
  promptCount: 0,
  neverShowAgain: false,
};

// 默认应用数据配置
const defaultAppData: AppDataType = {
  open: false,
  rcrl: false,
  city: { position: undefined, name: '' },
  times: ["6:00", "18:00"],
  Autostart: SystemStart,
  language: undefined,
  StartShow: true,
  Skipversion: '',
  winBgEffect: isWin11 ? 'Mica' : 'Default',
  deviation: 15,
  rawTime: ["6:00", "18:00"],
  ratingPrompt: defaultRatingPrompt,
  StyemTheme: [],
  StyemThemeEnable: false
};

interface AppDataStore {
  AppData: AppDataType;
  setData: (update: Partial<AppDataType>) => void;
  updateRatingPrompt: (update: Partial<RatingPromptType>) => void;
}

const useAppDataStore = create<AppDataStore>()(
  persist(
    (set) => ({
      AppData: defaultAppData,

      setData: (update: Partial<AppDataType>) => {
        set((state) => {
          const prevData = state.AppData || defaultAppData;

          // 创建更新后的对象
          const updatedData = {
            ...prevData,
            ...update,
          };

          // 确保ratingPrompt字段存在且结构正确
          if (!updatedData.ratingPrompt) {
            updatedData.ratingPrompt = { ...defaultRatingPrompt };
          }

          // 确保language字段有效
          if (!updatedData.language || updatedData.language === '') {
            updatedData.language = 'en_US';
          }

          return { AppData: updatedData as AppDataType };
        });
      },

      updateRatingPrompt: (update: Partial<RatingPromptType>) => {
        set((state) => {
          const prevData = state.AppData || defaultAppData;

          // 创建更新后的对象
          const updatedData = {
            ...prevData,
            ratingPrompt: {
              ...(prevData.ratingPrompt || defaultRatingPrompt),
              ...update
            }
          };

          return { AppData: updatedData as AppDataType };
        });
      },
    }),
    {
      name: 'AppData',
      // 使用自定义的合并逻辑来替换默认的浅合并
      merge: (persistedState, currentState) => {
        if (typeof persistedState === 'object' && persistedState !== null) {
          const merged = deepMerge(currentState, persistedState);

          // 确保ratingPrompt结构正确
          if (!merged.AppData.ratingPrompt) {
            merged.AppData.ratingPrompt = { ...defaultRatingPrompt };
          } else {
            merged.AppData.ratingPrompt = {
              ...defaultRatingPrompt,
              ...merged.AppData.ratingPrompt
            };
          }

          // 确保language字段有效，防止空字符串key导致的问题
          if (!merged.AppData.language || merged.AppData.language === '') {
            merged.AppData.language = 'en_US';
          }

          return merged;
        }
        return currentState;
      },
      // 可选的版本控制，用于未来的数据迁移
      version: 1,
    }
  )
);

// 保持原有API结构的hook
const useAppData = () => {
  const { AppData, setData, updateRatingPrompt } = useAppDataStore();

  return {
    AppData,
    setData,
    updateRatingPrompt
  };
};

export default useAppData;