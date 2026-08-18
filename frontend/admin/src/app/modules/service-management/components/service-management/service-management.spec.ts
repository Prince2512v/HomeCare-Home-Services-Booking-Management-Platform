import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ServiceManagement } from './service-management';
import { ServiceManagementService } from '../../services/service-management.service';
import { MasterDataService } from '@masterDataServices';

// mock helpers — match exact model shapes
const apiRes = (records: any[]) =>
  ({ data: { records }, isSuccess: true, statusCode: 200, message: '', errorMessages: [] } as any);
const mkType = (id = 1) => ({ id, serviceName: 'Cleaning' } as any);
const mkCat = (id = 1) => ({ id, categoryName: 'Window Cleaning', serviceTypeId: 1 } as any);
const mkSub = (id = 1) => ({ id, subCategoryName: '2BHK', categoryId: 1 } as any);
const mkSvc = (id = 1) =>
  ({
    id,
    name: '2 BHK',
    subCategoryName: '2BHK',
    price: 100,
    commission: 20,
    isAvailable: true,
  } as any);

describe('ServiceManagement', () => {
  let component: ServiceManagement;
  let fixture: ComponentFixture<ServiceManagement>;
  let svcSpy: jasmine.SpyObj<ServiceManagementService>;
  let masterSpy: jasmine.SpyObj<MasterDataService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('ServiceManagementService', [
      'getServiceTypes',
      'getCategoriesByServiceType',
      'getSubCategoriesByCategory',
      'getServicesBySubCategory',
      'toggleServiceAvailability',
      'deleteService',
      'getImageUrl',
    ]);
    masterSpy = jasmine.createSpyObj('MasterDataService', [
      'getCategoriesByServiceType',
      'getSubCategoriesByCategories',
      'createCategory',
      'createSubCategory',
      'deleteCategory',
      'deleteSubCategory',
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

    svcSpy.getServiceTypes.and.returnValue(of(apiRes([mkType()])));
    svcSpy.getCategoriesByServiceType.and.returnValue(of(apiRes([mkCat()])));
    svcSpy.getSubCategoriesByCategory.and.returnValue(of(apiRes([mkSub()])));
    svcSpy.getServicesBySubCategory.and.returnValue(of(apiRes([mkSvc()])));
    svcSpy.getImageUrl.and.returnValue('http://fake/img/1');
    routerSpy.getCurrentNavigation.and.returnValue(null as any);

    await TestBed.configureTestingModule({
      imports: [ServiceManagement],
      providers: [
        { provide: ServiceManagementService, useValue: svcSpy },
        { provide: MasterDataService, useValue: masterSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // creation

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ngOnInit

  describe('ngOnInit', () => {
    it('should load service types on init', () => {
      expect(svcSpy.getServiceTypes).toHaveBeenCalledTimes(1);
      expect(component.serviceTypes.length).toBe(1);
      expect(component.serviceTypes[0].serviceName).toBe('Cleaning');
    });

    it('should start with no expanded cards', () => {
      expect(component.expandedIds.size).toBe(0);
    });

    it('should restore accordion state from navigation history state', () => {
      (history as any).state = { serviceTypeId: 1, categoryId: 2 };
      component.ngOnInit();
      expect(component.expandedIds.has(1)).toBeTrue();
      expect(component.selectedCategoryMap.get(1)).toBe(2);
      (history as any).state = {};
    });
  });

  // accordion

  describe('toggleExpand', () => {
    it('should expand collapsed card and load categories', () => {
      component.toggleExpand(1);
      expect(component.isExpanded(1)).toBeTrue();
      expect(svcSpy.getCategoriesByServiceType).toHaveBeenCalledWith(1);
    });

    it('should collapse already-expanded card', () => {
      component.expandedIds.add(1);
      component.toggleExpand(1);
      expect(component.isExpanded(1)).toBeFalse();
    });

    it('should NOT reload categories if already cached', () => {
      component.categoriesMap.set(1, [mkCat()]);
      const before = svcSpy.getCategoriesByServiceType.calls.count();
      component.toggleExpand(1);
      expect(svcSpy.getCategoriesByServiceType.calls.count()).toBe(before);
    });

    it('should load subcategories for ALL categories so count badges work', fakeAsync(() => {
      svcSpy.getCategoriesByServiceType.and.returnValue(of(apiRes([mkCat(1), mkCat(2)])));
      component.loadCategoriesForAccordion(1);
      tick();
      expect(svcSpy.getSubCategoriesByCategory).toHaveBeenCalledWith(1);
      expect(svcSpy.getSubCategoriesByCategory).toHaveBeenCalledWith(2);
    }));
  });

  // category cards

  describe('category selection', () => {
    it('should update selected category', () => {
      component.selectCategoryCard(1, 5);
      expect(component.selectedCategoryMap.get(1)).toBe(5);
    });

    it('should load subcategories on new selection', () => {
      component.selectCategoryCard(1, 5);
      expect(svcSpy.getSubCategoriesByCategory).toHaveBeenCalledWith(5);
    });

    it('should NOT reload if already cached', () => {
      component.subCategoriesMap.set(5, [mkSub()]);
      const before = svcSpy.getSubCategoriesByCategory.calls.count();
      component.selectCategoryCard(1, 5);
      expect(svcSpy.getSubCategoriesByCategory.calls.count()).toBe(before);
    });

    it('isSelectedCategory should return true only for active', () => {
      component.selectedCategoryMap.set(1, 5);
      expect(component.isSelectedCategory(1, 5)).toBeTrue();
      expect(component.isSelectedCategory(1, 6)).toBeFalse();
    });
  });

  // service count badges

  describe('getServicesCountForCategory', () => {
    it('should sum services across all subcategories', () => {
      component.subCategoriesMap.set(1, [mkSub(10), mkSub(11)]);
      component.servicesMap.set(10, [mkSvc(1), mkSvc(2)]);
      component.servicesMap.set(11, [mkSvc(3)]);
      expect(component.getServicesCountForCategory(1)).toBe(3);
    });

    it('should return 0 if not loaded yet', () => {
      expect(component.getServicesCountForCategory(999)).toBe(0);
    });
  });

  // services table

  describe('getServices', () => {
    it('should return all services for selected category', () => {
      component.selectedCategoryMap.set(1, 10);
      component.subCategoriesMap.set(10, [mkSub(5), mkSub(6)]);
      component.servicesMap.set(5, [mkSvc(1), mkSvc(2)]);
      component.servicesMap.set(6, [mkSvc(3)]);
      expect(component.getServices(1).length).toBe(3);
    });

    it('should return empty array if no category selected', () => {
      expect(component.getServices(999)).toEqual([]);
    });
  });

  // toggle availability

  describe('toggleSubCategoryActive', () => {
    it('should optimistically update isAvailable', () => {
      const item = mkSvc();
      svcSpy.toggleServiceAvailability.and.returnValue(of({ data: true } as any));
      component.toggleSubCategoryActive(item, false);
      expect(item.isAvailable).toBeFalse();
    });

    it('should revert on API error', fakeAsync(() => {
      const item = mkSvc(); // isAvailable = true
      svcSpy.toggleServiceAvailability.and.returnValue(
        throwError(() => ({ error: { message: 'Server error' } }))
      );
      component.toggleSubCategoryActive(item, false);
      tick();
      expect(item.isAvailable).toBeTrue();
      expect(toastrSpy.error).toHaveBeenCalledWith('Server error');
    }));
  });

  // filter

  describe('filter', () => {
    beforeEach(() => {
      component.selectedCategoryMap.set(1, 10);
      component.subCategoriesMap.set(10, [mkSub(5)]);
    });

    it('openFilter should set openFilterServiceTypeId', () => {
      component.openFilter(1);
      expect(component.openFilterServiceTypeId).toBe(1);
    });

    it('applyFilter should store active filter', () => {
      component.applyFilter(1, {
        subCategoryId: 5,
        price_min: 50,
        price_max: 200,
        isAvailable: true,
        commission: null,
      });
      expect(component.activeFiltersMap.has(1)).toBeTrue();
    });

    it('isFilterActive should be true when filter set', () => {
      component.activeFiltersMap.set(1, { subCategoryId: 5 });
      expect(component.isFilterActive(1)).toBeTrue();
    });

    it('applyFilter with all nulls should clear filter', () => {
      component.activeFiltersMap.set(1, { subCategoryId: 5 });
      component.applyFilter(1, {
        subCategoryId: null,
        price_min: null,
        price_max: null,
        isAvailable: null,
        commission: null,
      });
      expect(component.activeFiltersMap.has(1)).toBeFalse();
    });

    it('applyFilter should close the panel', () => {
      component.openFilterServiceTypeId = 1;
      component.applyFilter(1, {
        subCategoryId: null,
        price_min: null,
        price_max: null,
        isAvailable: null,
        commission: null,
      });
      expect(component.openFilterServiceTypeId).toBeNull();
    });
  });

  // delete service

  describe('confirmDeleteService', () => {
    beforeEach(() => {
      component['serviceToDelete'] = { id: 1, name: '2 BHK' };
      component.addServiceCategoryId = 10;
      component.subCategoriesMap.set(10, [mkSub(5)]);
    });

    it('should call deleteService with correct id', fakeAsync(() => {
      svcSpy.deleteService.and.returnValue(of({ message: 'Deleted.', data: true } as any));
      component.confirmDeleteService();
      tick();
      expect(svcSpy.deleteService).toHaveBeenCalledWith(1);
    }));

    it('should show backend success message', fakeAsync(() => {
      svcSpy.deleteService.and.returnValue(of({ message: 'Service removed.', data: true } as any));
      component.confirmDeleteService();
      tick();
      expect(toastrSpy.success).toHaveBeenCalledWith('Service removed.');
    }));

    it('should close modal after success', fakeAsync(() => {
      svcSpy.deleteService.and.returnValue(of({ message: 'Deleted.', data: true } as any));
      component.isDeleteServiceModalOpen = true;
      component.confirmDeleteService();
      tick();
      expect(component.isDeleteServiceModalOpen).toBeFalse();
    }));

    it('should show backend error on failure', fakeAsync(() => {
      svcSpy.deleteService.and.returnValue(
        throwError(() => ({ error: { message: 'Cannot delete active service.' } }))
      );
      component.confirmDeleteService();
      tick();
      expect(toastrSpy.error).toHaveBeenCalledWith('Cannot delete active service.');
    }));

    it('should do nothing if serviceToDelete is null', () => {
      component['serviceToDelete'] = null;
      component.confirmDeleteService();
      expect(svcSpy.deleteService).not.toHaveBeenCalled();
    });
  });

  // navigation

  describe('navigateToService', () => {
    it('should navigate to service detail', () => {
      component.navigateToService(5);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/service-management/service', 5]);
    });
  });

  //  dropdown

  describe('toggleDropdown', () => {
    it('should open dropdown', () => {
      const e = { stopPropagation: jasmine.createSpy() } as any;
      component.toggleDropdown(5, e);
      expect(component.activeDropdownServiceId).toBe(5);
    });

    it('should close if same id clicked again', () => {
      const e = { stopPropagation: jasmine.createSpy() } as any;
      component.activeDropdownServiceId = 5;
      component.toggleDropdown(5, e);
      expect(component.activeDropdownServiceId).toBeNull();
    });

    it('closeDropdowns should clear active dropdown', () => {
      component.activeDropdownServiceId = 5;
      component.closeDropdowns();
      expect(component.activeDropdownServiceId).toBeNull();
    });
  });

  // manage category modal

  describe('closeModal', () => {
    it('should reset all modal state', () => {
      component.isModalOpen = true;
      component.pendingCategories = [{ tempId: 't1', categoryName: 'Cat' }];
      component.pendingSubCategories = [{ tempId: 't2', subCategoryName: 'Sub' }];
      component.closeModal();
      expect(component.isModalOpen).toBeFalse();
      expect(component.pendingCategories.length).toBe(0);
      expect(component.pendingSubCategories.length).toBe(0);
    });
  });

  describe('saveAllToDb', () => {
    it('should warn if nothing to save', () => {
      component.pendingCategories = [];
      component.pendingSubCategories = [];
      component.pendingDeletedCategories = [];
      component.pendingDeletedSubCategories = [];
      component.saveAllToDb();
      expect(toastrSpy.warning).toHaveBeenCalledWith('Nothing to save.');
    });
  });

  // scenario: full flow

  describe('Scenario: expand → filter → delete', () => {
    it('should complete without errors', fakeAsync(() => {
      component.toggleExpand(1);
      tick();
      expect(component.isExpanded(1)).toBeTrue();

      component.subCategoriesMap.set(1, [mkSub(5)]);
      component.selectedCategoryMap.set(1, 1);
      component.selectCategoryCard(1, 1);
      tick();

      component.applyFilter(1, {
        subCategoryId: 5,
        price_min: 50,
        price_max: null,
        isAvailable: true,
        commission: null,
      });
      expect(component.isFilterActive(1)).toBeTrue();

      svcSpy.deleteService.and.returnValue(of({ message: 'Service deleted.', data: true } as any));
      component['serviceToDelete'] = { id: 10, name: '2 BHK' };
      component.addServiceCategoryId = 1;
      component.confirmDeleteService();
      tick();
      expect(toastrSpy.success).toHaveBeenCalled();
    }));
  });
});
