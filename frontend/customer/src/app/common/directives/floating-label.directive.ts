import {Directive,ElementRef,HostListener,Input,OnInit,Renderer2} from '@angular/core';

@Directive({
  selector: '[appFloatingLabel]',
  standalone: true,
})
export class FloatingLabelDirective implements OnInit {
  /** The label text to float above the input */
  @Input('appFloatingLabel') labelText = '';
  @Input('appRequiredLabel') showRequired = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    const input: HTMLElement = this.el.nativeElement;

    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'fl-wrapper');
    this.renderer.addClass(wrapper, 'position-relative');
    this.renderer.addClass(wrapper, 'w-100');
    // Insert wrapper before the input in the DOM
    const parent = this.renderer.parentNode(input);
    this.renderer.insertBefore(parent, wrapper, input);

    this.renderer.removeChild(parent, input);
    this.renderer.appendChild(wrapper, input);

    this.renderer.addClass(input, 'fl-input');
    this.renderer.addClass(input, 'form-control');

    this.renderer.setAttribute(input, 'placeholder', ' ');

    const label = this.renderer.createElement('label');
    this.renderer.addClass(label, 'fl-label');
    const text = this.renderer.createText(this.labelText);
    this.renderer.appendChild(label, text);

    if (this.showRequired) {
      const star = this.renderer.createElement('span');
      this.renderer.setStyle(star, 'color', '#dc3545');
      this.renderer.setStyle(star, 'margin-left', '3px');
      const starText = this.renderer.createText('*');
      this.renderer.appendChild(star, starText);
      this.renderer.appendChild(label, star);
    }

    this.renderer.appendChild(wrapper, label);
  }

  @HostListener('focus')
  onFocus(): void {
    const wrapper = this.el.nativeElement.closest('.fl-wrapper');
    if (wrapper) {
      this.renderer.addClass(wrapper, 'fl-focused');
    }
  }

  @HostListener('blur')
  onBlur(): void {
    const wrapper = this.el.nativeElement.closest('.fl-wrapper');
    if (wrapper) {
      this.renderer.removeClass(wrapper, 'fl-focused');
    }
  }
}