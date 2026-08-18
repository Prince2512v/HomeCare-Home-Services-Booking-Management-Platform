export interface ConfirmationModelConfig {
    title: string;
    message: string;
    cancelText: string;
    confirmText: string;
  }

  export function createConfirmationConfig(name: string): ConfirmationModelConfig{
    return {
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${name}"?`,
      cancelText: 'Cancel',
      confirmText: 'Confirm'
    };
  }