export type TaskCenterCategory =
  | 'import'
  | 'export'
  | 'process'
  | 'publish'
  | 'annotation';

export type TaskCenterStatus = 'running' | 'completed';

export type TaskCenterFilterStatus = 'all' | TaskCenterStatus;

export interface TaskCenterRecord {
  id: string;
  category: TaskCenterCategory;
  moduleKey: string;
  moduleName: string;
  content: string;
  time: string;
  status: TaskCenterStatus;
  actionLabel?: string;
}
