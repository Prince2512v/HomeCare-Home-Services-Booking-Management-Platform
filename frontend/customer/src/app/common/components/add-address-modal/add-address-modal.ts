import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  map,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LEAFLET } from '@constants';
import type { Address, CreateAddressRequest, NominatimResult } from '@profile';
import { ProfileService } from '@profileservices';
import { FloatingLabelDirective } from '../../directives/floating-label.directive';
import { RequiredFieldDirective } from '../../directives/required-field.directive';
import { AppValidators } from '../../validators/app.validators';

@Component({
  selector: 'app-add-address-modal',
  imports: [
    CommonModule,
    FormsModule,
    FloatingLabelDirective,
    RequiredFieldDirective,
  ],
  templateUrl: './add-address-modal.html',
  styleUrl: './add-address-modal.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddAddressModal implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() address: Address | null = null;
  @Input() recentAddresses: Address[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  private profileService = inject(ProfileService);
  private toastr = inject(ToastrService);

  step = 1;
  searchQuery = '';
  searchResults: NominatimResult[] = [];
  isSearching = false;
  showResults = false;
  private searchInput$ = new Subject<string>();

  private map: any;
  private marker: any;
  lat = LEAFLET.DEFAULT_LAT;
  lng = LEAFLET.DEFAULT_LNG;
  displayTitle = '';
  displaySubtitle = '';
  isGeocoding = false;

  houseFlatNumber = '';
  landmark = '';
  saveAs = 'Home';
  customLabel = '';
  isSaving = false;
  isLocating = false;
  duplicateAddressError = '';

  get isEdit(): boolean {
    return !!this.address;
  }

  get fullDisplayAddress(): string {
    return [
      this.houseFlatNumber?.trim(),
      this.landmark?.trim(),
      this.displayTitle?.trim(),
      this.displaySubtitle?.trim(),
    ]
      .filter(Boolean)
      .join(', ');
  }

  ngOnInit(): void {
    if (this.address) {
      this.populateFromAddress(this.address);
    }

    this.searchInput$
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((searchQuery) => {
          if (!searchQuery || searchQuery.trim().length < 4) {
            this.searchResults = [];
            this.isSearching = false;
            return of([]);
          }
          this.isSearching = true;
          return this.profileService
            .searchAddress(searchQuery.trim())
            .pipe(map((response) => response?.data ?? []));
        }),
      )
      .subscribe({
        next: (results: NominatimResult[]) => {
          this.isSearching = false;
          this.searchResults = results;
          this.showResults = results.length > 0;
        },
        error: () => {
          this.isSearching = false;
        },
      });

    this.loadLeaflet();
  }

  ngAfterViewInit(): void {
    if (this.isEdit) {
      this.step = 2;
      this.initMapWhenReady();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.searchInput$.complete();
  }

  private populateFromAddress(address: Address): void {
    this.houseFlatNumber = address.houseFlatNumber;
    this.landmark = address.landmark ?? '';
    this.displayTitle = address.fullAddress ?? '';
    this.displaySubtitle = '';
    this.lat = address.latitude;
    this.lng = address.longitude;
    this.saveAs = address.saveAs ?? 'Home';
  }

  private loadLeaflet(): void {
    if ((window as any).L) return;

    if (!document.querySelector(`#${LEAFLET.CSS_ID}`)) {
      const link = document.createElement('link');
      link.id = LEAFLET.CSS_ID;
      link.rel = 'stylesheet';
      link.href = LEAFLET.CSS_URL;
      document.head.appendChild(link);
    }

    if (!document.querySelector(`#${LEAFLET.JS_ID}`)) {
      const script = document.createElement('script');
      script.id = LEAFLET.JS_ID;
      script.src = LEAFLET.JS_URL;
      document.head.appendChild(script);
    }
  }

  onSearchInput(): void {
    this.searchInput$.next(this.searchQuery);
    if (!this.searchQuery.trim()) {
      this.showResults = false;
      this.searchResults = [];
    } else if (this.searchResults.length > 0) {
      this.showResults = true;
    }
  }

  onSearchFocus(): void {
    if (this.searchResults.length > 0) {
      this.showResults = true;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  selectSearchResult(result: NominatimResult): void {
    this.lat = parseFloat(result.lat);
    this.lng = parseFloat(result.lon);
    this.displayTitle = this.nominatimTitle(result);
    this.displaySubtitle = this.nominatimSubtitle(result);
    this.showResults = false;
    this.goToStep2();
  }

  selectRecent(recentAddress: Address): void {
    this.lat = recentAddress.latitude;
    this.lng = recentAddress.longitude;
    this.displayTitle = recentAddress.fullAddress ?? '';
    this.displaySubtitle = '';
    this.goToStep2();
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) return;
    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.isLocating = false;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.displayTitle = '';
        this.goToStep2();
      },
      () => {
        this.isLocating = false;
        this.goToStep2();
      },
    );
  }

  goToStep2(): void {
    this.step = 2;
    this.initMapWhenReady();
  }

  backToStep1(): void {
    this.step = 1;
    this.showResults = false;
    this.map?.remove();
    this.map = null;
  }

  private initMapWhenReady(attempts = 0): void {
    setTimeout(() => {
      if ((window as any).L && this.mapContainer?.nativeElement) {
        this.initMap();
      } else if (attempts < 20) {
        this.initMapWhenReady(attempts + 1);
      }
    }, 100);
  }

  private initMap(): void {
    const L = (window as any).L;
    if (!this.mapContainer?.nativeElement || this.map) return;

    const pinIcon = L.icon(LEAFLET.PIN_ICON);

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.lat, this.lng],
      zoom: LEAFLET.DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer(LEAFLET.TILE_URL, {
      attribution: LEAFLET.TILE_ATTRIBUTION,
      maxZoom: LEAFLET.TILE_MAX_ZOOM,
    }).addTo(this.map);

    this.marker = L.marker([this.lat, this.lng], {
      draggable: true,
      icon: pinIcon,
    }).addTo(this.map);

    if (!this.displayTitle) this.resolveAddress(this.lat, this.lng);

    this.map.on('click', (event: any) =>
      this.moveAndResolve(event.latlng.lat, event.latlng.lng),
    );
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.moveAndResolve(position.lat, position.lng);
    });
  }

  locateMe(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) =>
      this.moveAndResolve(
        position.coords.latitude,
        position.coords.longitude,
        LEAFLET.LOCATE_ZOOM,
      ),
    );
  }

  private moveAndResolve(
    latitude: number,
    longitude: number,
    zoom = LEAFLET.DEFAULT_ZOOM,
  ): void {
    this.lat = latitude;
    this.lng = longitude;
    this.duplicateAddressError = '';
    this.marker?.setLatLng([latitude, longitude]);
    this.map?.setView([latitude, longitude], zoom);
    this.resolveAddress(latitude, longitude);
  }

  private resolveAddress(latitude: number, longitude: number): void {
    this.isGeocoding = true;
    this.profileService.reverseGeocode(latitude, longitude).subscribe({
      next: (response) => {
        this.isGeocoding = false;
        this.displayTitle =
          response?.data?.displayTitle ??
          `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        this.displaySubtitle = response?.data?.displaySubtitle ?? '';
      },
      error: () => {
        this.isGeocoding = false;
        this.displayTitle = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        this.displaySubtitle = '';
      },
    });
  }

  onAdd(): void {
    if (!this.houseFlatNumber.trim()) {
      return;
    }

    const fullAddress =
      [this.displayTitle?.trim(), this.displaySubtitle?.trim()]
        .filter(Boolean)
        .join(', ') || `${this.lat.toFixed(5)}, ${this.lng.toFixed(5)}`;

    // Duplicate check: same houseFlatNumber + fullAddress, skip current address on edit
    const isDuplicate = this.recentAddresses.some((a) => {
      if (this.isEdit && a.addressId === this.address!.addressId) return false;
      return (
        a.houseFlatNumber.trim().toLowerCase() ===
          this.houseFlatNumber.trim().toLowerCase() &&
        a.fullAddress.trim().toLowerCase() === fullAddress.trim().toLowerCase()
      );
    });

if (isDuplicate) {
  this.toastr.error(AppValidators.Messages.duplicateAddress);
  return;
}

    this.duplicateAddressError = '';
    this.isSaving = true;

    const addressRequest: CreateAddressRequest = {
      houseFlatNumber: this.houseFlatNumber.trim(),
      landmark: this.landmark.trim(),
      fullAddress,
      saveAs:
        this.saveAs === 'Other'
          ? this.customLabel.trim() || this.saveAs
          : this.saveAs,
      latitude: this.lat,
      longitude: this.lng,
    };

    const saveRequest$ = this.isEdit
      ? this.profileService.updateAddress(
          this.address!.addressId,
          addressRequest,
        )
      : this.profileService.createAddress(addressRequest);

    saveRequest$.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit(this.isEdit ? 'updated' : 'added');
      },
      error: (error) => {
        this.isSaving = false;
        const msg = error?.error?.message;
        this.toastr.error(msg);
      },
    });
  }

  setSaveAs(value: string): void {
    this.saveAs = value;
  }

  nominatimTitle(result: NominatimResult): string {
    const addr = result?.address;
    if (!addr) {
      return (
        result?.display_name?.split(',').slice(0, 2).join(',').trim() || ''
      );
    }
    return (
      [addr.road, addr.suburb, addr.city || addr.town || addr.village]
        .filter(Boolean)
        .join(', ') ||
      result.display_name.split(',').slice(0, 2).join(',').trim()
    );
  }

  nominatimSubtitle(result: NominatimResult): string {
    const addr = result?.address;
    if (!addr) return '';
    return [addr.city || addr.town || addr.village, addr.state, addr.country]
      .filter(Boolean)
      .join(', ');
  }
}
