import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appRequiredField]',
  standalone: true,
})
export class RequiredFieldDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appRequiredField') isRequired: boolean | '' = true;

  private asteriskSpan: HTMLElement | null = null;
  private observer: MutationObserver | null = null;

  private readonly neutralColor = '#6c757d';
  private readonly errorColor   = '#dc3545';

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.applyAsterisk();
    this.watchInputValidity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isRequired']) {
      this.applyAsterisk();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private get required(): boolean {
    return this.isRequired === '' || this.isRequired === true;
  }

  private applyAsterisk(): void {
    const label = this.el.nativeElement.querySelector('label');
    if (!label) return;

    if (this.required) {
      if (!this.asteriskSpan) {
        this.asteriskSpan = this.renderer.createElement('span');
        this.renderer.addClass(this.asteriskSpan, 'required-asterisk');
        this.renderer.setStyle(this.asteriskSpan, 'margin-left', '3px');
        this.renderer.setStyle(this.asteriskSpan, 'font-weight', 'bold');
        this.renderer.setStyle(this.asteriskSpan, 'transition', 'color 0.15s ease');
        this.renderer.setProperty(this.asteriskSpan, 'textContent', '*');
        this.renderer.setAttribute(this.asteriskSpan, 'aria-hidden', 'true');
      }

      this.renderer.setStyle(this.asteriskSpan, 'color', this.neutralColor);

      if (!label.querySelector('.required-asterisk')) {
        this.renderer.appendChild(label, this.asteriskSpan);
      }
    } else {
      const existing = label.querySelector('.required-asterisk');
      if (existing) this.renderer.removeChild(label, existing);
      this.asteriskSpan = null;
    }
  }

  private watchInputValidity(): void {
    const input = this.el.nativeElement.querySelector('input, textarea');
    if (!input) return;

    this.observer = new MutationObserver(() => {
      this.syncAsteriskColor(input as HTMLElement);
    });

    this.observer.observe(input, {
      attributes: true,
      attributeFilter: ['class'],
    });

    this.syncAsteriskColor(input as HTMLElement);
  }

  private syncAsteriskColor(input: HTMLElement): void {
    if (!this.asteriskSpan) return;
    const isInvalid = input.classList.contains('is-invalid');
    this.renderer.setStyle(
      this.asteriskSpan,
      'color',
      isInvalid ? this.errorColor : this.neutralColor,
    );
  }
}