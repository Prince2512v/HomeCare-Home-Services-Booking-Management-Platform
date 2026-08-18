export interface DeleteModelConfig {
  title: string;
  message: string;
  cancelText: string;
  deleteText: string;
}

export function createDeleteConfig(name: string): DeleteModelConfig {
  return {
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${name}"?`,
    cancelText: 'Cancel',
    deleteText: 'Delete'
  };
}