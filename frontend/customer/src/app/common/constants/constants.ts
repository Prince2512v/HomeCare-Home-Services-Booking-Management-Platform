export const Constant = {
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  ADD: 'Add',
  UPDATE: 'Update',
  VERIFY: 'Verify',
  GET_OTP: 'Get OTP',
  SIGN_IN: 'Sign In',
};

export const PAYMENT_METHODS = {
  CARD: 'Debit/Credit Card',
  CASH: 'Cash',
} as const;

export const VALIDATION_MESSAGES = {
  required: 'This field is required.',
  emailRequired: 'Email is required.',
  invalidEmail: 'Please enter a valid email address.',
  mobileRequired: 'Mobile number is required.',
  invalidPhone: 'Please enter a valid mobile number (7–15 digits).',
  duplicateAddress: 'This address has already been added.',
} as const;
