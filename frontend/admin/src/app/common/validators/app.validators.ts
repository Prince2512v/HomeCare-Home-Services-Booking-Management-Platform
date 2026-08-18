import { AbstractControl, ValidationErrors } from '@angular/forms';

export class AppValidators {
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const valid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(control.value);

    return valid ? null : { invalidEmail: true };
  }

  static password(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const valid =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,15}$/.test(
        control.value
      );

    return valid ? null : { invalidPassword: true };
  }

  static name(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const valid = /^[a-zA-Z0-9\s&'()]{2,100}$/.test(control.value.trim());

    return valid ? null : { invalidName: true };
  }

  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.trim();

    const pattern = /^\+?[0-9\s\-()]+$/;

    if (!pattern.test(value)) {
      return { invalidPhone: true };
    }

    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length < 6 || digitsOnly.length > 15) {
      return { invalidPhone: true };
    }

    return null;
  }
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (value === null || value === undefined) return null;

    if (typeof value === 'string' && value.trim().length === 0) {
      return { whitespace: true };
    }

    return null;
  }

  static matchPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordKey);
      const confirmPassword = formGroup.get(confirmPasswordKey);

      if (!password || !confirmPassword) return null;

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({
          ...confirmPassword.errors,
          passwordMismatch: true,
        });

        return { passwordMismatch: true };
      }

      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordMismatch'];

        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }

      return null;
    };
  }

  static address(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.trim();

   const pattern = /^[a-zA-Z0-9\s,.\-/#()]+$/;

    if (!pattern.test(value)) {
      return { invalidAddress: true };
    }

    if (value.length < 10 || value.length > 200) {
      return { invalidAddress: true };
    }

    if (/\s{2,}/.test(value)) {
      return { invalidAddress: true };
    }

    return null;
  }

  // Image Validator: check file type and size
  static image(control: AbstractControl): ValidationErrors | null {
    const file: File = control.value;

    if (!file) return null;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(extension)) {
      return { invalidImageType: true };
    }

    return null;
  }

  static uniqueName(getExistingNames: () => string[], excludeName?: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const inputName = control.value.trim().toLowerCase();
      const excludeLower = excludeName?.trim().toLowerCase();

      const isDuplicate = getExistingNames().some((name) => {
        const existing = name.trim().toLowerCase();
        return existing === inputName && existing !== excludeLower;
      });

      return isDuplicate ? { duplicateName: true } : null;
    };
  }

  static sameAsCurrentPassword(currentKey: string, newKey: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const current = formGroup.get(currentKey)?.value;
      const newVal = formGroup.get(newKey)?.value;
      if (current && newVal && current === newVal) {
        return { samePassword: true };
      }
      return null;
    };
  }
}
