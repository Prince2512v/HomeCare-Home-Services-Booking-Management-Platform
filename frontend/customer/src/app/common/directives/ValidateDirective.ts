import { Directive, ElementRef, OnInit, OnDestroy, Renderer2, inject } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppValidators } from '@Validators';

@Directive({
  selector: '[appValidate]',
  standalone: true,
})
export class ValidateDirective implements OnInit, OnDestroy {
  private control!: AbstractControl;
  private errorEl!: HTMLElement;
  private subscription!: Subscription;
  private blurUnlisten!: () => void;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private container = inject(ControlContainer);

  ngOnInit(): void {
    const name = this.el.nativeElement.getAttribute('formControlName');
    this.control = (this.container.control as FormGroup).get(name) as AbstractControl;

    this.errorEl = this.renderer.createElement('div');
    this.renderer.addClass(this.errorEl, 'invalid-feedback');
    this.renderer.addClass(this.errorEl, 'd-none');
    this.renderer.addClass(this.errorEl, 'text-start');
    this.renderer.insertBefore(
      this.el.nativeElement.parentNode,
      this.errorEl,
      this.el.nativeElement.nextSibling
    );

    this.subscription = this.control.statusChanges.subscribe(() => this.update());

    this.blurUnlisten = this.renderer.listen(this.el.nativeElement, 'blur', () => {
      this.control.markAsTouched();
      this.update();
    });
  }

  update(): void {
    const requiredMsg =
      this.el.nativeElement.getAttribute('requiredMsg') ?? 'This field is required.';
    const msg = AppValidators.getErrorMessage(this.control, requiredMsg);

    if (msg) {
      this.renderer.removeClass(this.errorEl, 'd-none');
      this.renderer.addClass(this.errorEl, 'd-block');
      this.errorEl.textContent = msg;
      this.renderer.addClass(this.el.nativeElement, 'is-invalid');
    } else {
      this.renderer.addClass(this.errorEl, 'd-none');
      this.renderer.removeClass(this.errorEl, 'd-block');
      this.errorEl.textContent = '';
      this.renderer.removeClass(this.el.nativeElement, 'is-invalid');
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.blurUnlisten?.();
  }
}
