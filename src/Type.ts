
// 在 src/Type.ts 中扩展 AppDataType
export interface positionType {
  lat: number;
  lng: number
  tzid: string
}
export interface AppDataType {
  open: boolean;
  rcrl: boolean;
  city: { position?: positionType; name: string };
  times: string[];
  Autostart: boolean;
  language?: string;
  StartShow: boolean;
  Skipversion: string;
  winBgEffect: string;
  deviation: number;
  rawTime: string[];
  // 新增评分相关字段
  ratingPrompt?: RatingPromptType
  //主题选项
  StyemTheme?: string[];
  StyemThemeEnable?: boolean
}

export interface TimesProps {
  disabled?: boolean;
}
declare const App: React.FC;
export default App;
export interface RatingPromptType {
  lastPromptTime: number; // 上次提示时间戳
  promptCount: number;    // 已提示次数
  neverShowAgain: boolean; // 不再提示
}
