import { AbstractControl, ValidationErrors } from '@angular/forms';
import { VALIDATION_MESSAGES } from '@constants';

export class AppValidators {
  static readonly Messages = VALIDATION_MESSAGES;

  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      control.value,
    );
    return valid ? null : { invalidEmail: true };
  }

  static name(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valid = /^[a-zA-Z\s]{2,50}$/.test(control.value.trim());
    return valid ? null : { invalidName: true };
  }

  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const digits = control.value.trim().replace(/\D/g, '');
    const valid = digits.length >= 7 && digits.length <= 15;
    return valid ? null : { invalidPhone: true };
  }

  static address(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value.trim();
    const pattern = /^[a-zA-Z0-9\s,.\-#()]+$/;
    if (!pattern.test(value)) return { invalidAddress: true };
    if (value.length < 10 || value.length > 200)
      return { invalidAddress: true };
    return null;
  }

  static date(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const raw: string = control.value.trim();
    let day: number, month: number, year: number;
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      [day, month, year] = raw.split('-').map(Number);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      [year, month, day] = raw.split('-').map(Number);
    } else {
      return { invalidDate: true };
    }
    const d = new Date(year, month - 1, day);
    const isReal =
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day;
    return isReal ? null : { invalidDate: true };
  }

  static dropdown(control: AbstractControl): ValidationErrors | null {
    const v = control.value;
    return v === null || v === undefined || v === ''
      ? { invalidDropdown: true }
      : null;
  }

  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' && value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  static password(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valid =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,15}$/.test(
        control.value,
      );
    return valid ? null : { invalidPassword: true };
  }

  static image(control: AbstractControl): ValidationErrors | null {
    const file: File = control.value;
    if (!file) return null;
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/svg+xml',
    ];
    const maxSizeInMB = 5;
    if (!allowedTypes.includes(file.type)) return { invalidImageType: true };
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeInMB) return { imageTooLarge: true };
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

  static schoolCollege(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return control.value.trim().length < 2 ? { invalidSchool: true } : null;
  }

  static passingYear(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const year = Number(control.value);
    const current = new Date().getFullYear();
    return String(control.value).length !== 4 || year < 1950 || year > current
      ? { invalidYear: true }
      : null;
  }

  static marks(control: AbstractControl): ValidationErrors | null {
    if (
      control.value === null ||
      control.value === undefined ||
      control.value === ''
    )
      return null;
    const val = Number(control.value);
    return isNaN(val) || val < 0 || val > 100 ? { invalidMarks: true } : null;
  }

  static companyName(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return control.value.trim().length < 2 ? { invalidCompany: true } : null;
  }

  static role(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return control.value.trim().length < 2 ? { invalidRole: true } : null;
  }

  static toDateAfterFromDate(
    control: AbstractControl,
  ): ValidationErrors | null {
    const parent = control.parent;
    if (!parent) return null;

    const fromDate = parent.get('fromDate')?.value;
    const toDate = control.value;

    if (!fromDate || !toDate) return null;

    const parseDate = (raw: string): Date | null => {
      if (!raw) return null;
      if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
        const [d, m, y] = raw.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return null;
    };

    const from = parseDate(fromDate);
    const to = parseDate(toDate);

    if (!from || !to) return null;

    return to <= from ? { toDateBeforeFromDate: true } : null;
  }

  static dobNotFuture(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const parseDate = (raw: string): Date | null => {
      if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
        const [d, m, y] = raw.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return null;
    };

    const dob = parseDate(control.value);
    if (!dob) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dob >= today ? { dobFutureDate: true } : null;
  }

  static getErrorMessage(
    control: AbstractControl,
    requiredMsg = AppValidators.Messages.required,
  ): string {
    if (!control || !(control.touched || control.dirty)) return '';

    if (control.hasError('required')) return requiredMsg;

    if (control.hasError('email') || control.hasError('invalidEmail'))
      return AppValidators.Messages.invalidEmail;

    if (control.hasError('minlength')) {
      const err = control.getError('minlength');
      const n = err?.requiredLength;
      return `Minimum ${n} characters required.`;
    }

    if (control.hasError('maxlength')) {
      const err = control.getError('maxlength');
      const n = err?.requiredLength;
      return `Maximum ${n} characters allowed.`;
    }

    if (control.hasError('whitespace')) return 'This field cannot be blank.';

    if (control.hasError('invalidSchool'))
      return 'School/College name must be at least 2 characters.';

    if (control.hasError('invalidYear'))
      return 'Please enter a valid passing year.';

    if (control.hasError('invalidCompany'))
      return 'Company name must be at least 2 characters.';

    if (control.hasError('invalidRole'))
      return 'Role must be at least 2 characters.';

    if (control.hasError('invalidMarks'))
      return 'Marks must be between 0 and 100.';

    if (control.hasError('dobFutureDate'))
      return 'Date of birth cannot be a future date.';

    if (control.hasError('toDateBeforeFromDate'))
      return 'To date must be after From date.';

    if (control.hasError('invalidPhone'))
      return AppValidators.Messages.invalidPhone;

    return '';
  }
}
