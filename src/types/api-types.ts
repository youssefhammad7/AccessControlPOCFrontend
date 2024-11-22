export interface StyleConfig {
    id: string;
    userName: string;
    roleId: string;
    roleName: string;
    styleName: string;
    uiElementClassName: string;
    componentName: string;
  }

export interface StyleConfig2 {
  subjectId: number;
  subjectName: string;
  uiElementClassName: string;
  description: string;
  style: {
    subjectStyleId: number;
    styleId: number;
    styleName: string;
    styleDescription: string;
  } | null;
}