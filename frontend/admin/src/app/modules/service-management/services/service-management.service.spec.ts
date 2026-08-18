import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServiceManagementService } from './service-management.service';
import { environment } from '../../../../environments/environment';

describe('ServiceManagementService', () => {
  let service: ServiceManagementService;
  let http: HttpTestingController;
  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceManagementService],
    });
    service = TestBed.inject(ServiceManagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getServiceTypes should GET /ServiceType/get', () => {
    const mock = { data: { records: [{ id: 1, serviceName: 'Cleaning' }] } };
    service.getServiceTypes().subscribe((res) => {
      expect((res as any).data.records[0].serviceName).toBe('Cleaning');
    });
    const req = http.expectOne(`${API}/ServiceType/get`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getCategoriesByServiceType should send serviceTypeId as query param', () => {
    service.getCategoriesByServiceType(1).subscribe();
    const req = http.expectOne(
      (r) => r.url === `${API}/categories/get` && r.params.get('serviceTypeId') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: { records: [] } });
  });

  it('getSubCategoriesByCategory should send categoryId as query param', () => {
    service.getSubCategoriesByCategory(2).subscribe();
    const req = http.expectOne(
      (r) => r.url === `${API}/subcategories/get` && r.params.get('categoryId') === '2'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: { records: [] } });
  });

  it('getServicesBySubCategory should POST with request body', () => {
    const request = {
      subCategoryId: 3,
      filterSubCategoryId: null,
      minPrice: null,
      maxPrice: 500,
      isAvailable: true,
      commission: null,
      pageNumber: 0,
      pageSize: 0,
    };
    service.getServicesBySubCategory(request).subscribe((res) => {
      expect((res as any).data.records[0].name).toBe('2 BHK');
    });
    const req = http.expectOne(`${API}/services/get`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ data: { records: [{ id: 1, name: '2 BHK' }] } });
  });

  it('toggleServiceAvailability should PATCH with false body', () => {
    service.toggleServiceAvailability(10, false).subscribe();
    const req = http.expectOne(`${API}/Services/10/availability`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBe(false);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({ data: true });
  });

  it('toggleServiceAvailability should PATCH with true body', () => {
    service.toggleServiceAvailability(10, true).subscribe();
    const req = http.expectOne(`${API}/Services/10/availability`);
    expect(req.request.body).toBe(true);
    req.flush({ data: true });
  });

  it('deleteService should call DELETE on correct URL', () => {
    service.deleteService(10).subscribe();
    const req = http.expectOne(`${API}/services/delete/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: true });
  });

  it('getServiceById should prefix relative image URLs', () => {
    const mock = { data: { id: 10, images: [{ id: 1, imageUrl: '/uploads/img.jpg' }] } };
    service.getServiceById(10).subscribe((res) => {
      expect(res.data.images[0].imageUrl).toBe(`${environment.resourceUrl}/uploads/img.jpg`);
    });
    http.expectOne(`${API}/services/get/10`).flush(mock);
  });

  it('getServiceById should NOT modify absolute image URLs', () => {
    const url = 'https://cdn.example.com/img.jpg';
    const mock = { data: { id: 10, images: [{ id: 1, imageUrl: url }] } };
    service.getServiceById(10).subscribe((res) => {
      expect(res.data.images[0].imageUrl).toBe(url);
    });
    http.expectOne(`${API}/services/get/10`).flush(mock);
  });

  it('getServiceById should handle service with no images', () => {
    const mock = { data: { id: 10, images: [] } };
    service.getServiceById(10).subscribe((res) => {
      expect(res.data.images.length).toBe(0);
    });
    http.expectOne(`${API}/services/get/10`).flush(mock);
  });

  it('getImageUrl should return correct URL for any id', () => {
    expect(service.getImageUrl(1)).toBe(`${API}/ServiceType/1/image`);
    expect(service.getImageUrl(99)).toBe(`${API}/ServiceType/99/image`);
  });
});
