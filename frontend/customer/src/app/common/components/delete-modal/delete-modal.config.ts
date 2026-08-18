export interface DeleteModalConfig {
  title: string;
  message: string;
  cancelText: string;
  deleteText: string;
}

export function createDeleteConfig(name: string): DeleteModalConfig {
  return {
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${name}"?`,
    cancelText: 'Cancel',
    deleteText: 'Delete',
  };
}