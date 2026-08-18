import { AfterViewInit, Directive, ElementRef, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appRequiredField]',
  standalone: true,
})
export class RequiredFieldDirective implements AfterViewInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngAfterViewInit(): void {
    const host: HTMLElement = this.el.nativeElement;
    const tagName = host.tagName.toLowerCase();

    const target: HTMLElement | null =
      tagName === 'input' || tagName === 'textarea'
        ? (host.closest('.fl-wrapper')?.querySelector('.fl-label') ?? null)
        : host;

    if (!target) return;

    const asterisk: HTMLElement = this.renderer.createElement('span');
    this.renderer.addClass(asterisk, 'required-asterisk');
    this.renderer.appendChild(asterisk, this.renderer.createText(' *'));
    this.renderer.appendChild(target, asterisk);
  }
}