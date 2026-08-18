using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/services")]
    public class ServicesController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public ServicesController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("get")]
        public async Task<ActionResult<ApiResponse<List<Service>>>> Get()
        {
            var list = await _context.Services
                .Include(s => s.SubCategory)
                .ThenInclude(sc => sc!.Category)
                .ToListAsync();
            return Ok(ApiResponse<List<Service>>.Success(list));
        }

        [HttpGet("get/{id}")]
        public async Task<ActionResult<ApiResponse<Service>>> GetById(int id)
        {
            var service = await _context.Services
                .Include(s => s.SubCategory)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (service == null) return NotFound(ApiResponse<Service>.Failure("Service not found"));
            return Ok(ApiResponse<Service>.Success(service));
        }

        [HttpGet("detail/{id}")]
        [Route("/api/services/detail/{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetDetail(int id)
        {
            var service = await _context.Services
                .Include(s => s.SubCategory)
                    .ThenInclude(sc => sc!.Category)
                        .ThenInclude(c => c!.ServiceType)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (service == null) return NotFound(ApiResponse<object>.Failure("Service detail not found"));

            var serviceTypeName = service.SubCategory?.Category?.ServiceType?.ServiceName?.ToLowerInvariant() ?? "";
            
            var inclusions = new List<string>();
            var exclusions = new List<string>();

            if (serviceTypeName.Contains("clean"))
            {
                inclusions.AddRange(new[] { "Deep vacuuming of all areas", "Wet mopping & sanitization", "Eco-friendly cleaning agents", "Dusting of furniture & fixtures" });
                exclusions.AddRange(new[] { "Removal of heavy debris/garbage", "Exterior window cleaning", "Hard stain removal from marble" });
            }
            else if (serviceTypeName.Contains("repair") || serviceTypeName.Contains("ac") || serviceTypeName.Contains("appliance"))
            {
                inclusions.AddRange(new[] { "Filter cleaning & wash", "Gas pressure check", "Wiring & leak check", "Post-service testing" });
                exclusions.AddRange(new[] { "Spare parts replacement cost", "Additional piping (if required)", "Major structural changes" });
            }
            else if (serviceTypeName.Contains("paint"))
            {
                inclusions.AddRange(new[] { "Wall cleaning & preparation", "Two coats of premium paint", "Masking & floor protection", "Final touch-up & cleanup" });
                exclusions.AddRange(new[] { "Major wall crack repair", "Dampness treatment cost", "Furniture moving assistance" });
            }
            else
            {
                inclusions.AddRange(new[] { "Professional service expert", "All tools & equipment included", "Service warranty", "Complete cleanup" });
                exclusions.AddRange(new[] { "Spare parts / materials (if extra)", "Complex height work", "Any additional services requested" });
            }

            var relatedList = await _context.Services
                .Include(s => s.SubCategory)
                    .ThenInclude(sc => sc!.Category)
                .Where(s => s.SubCategoryId == service.SubCategoryId && s.Id != service.Id)
                .Take(3)
                .ToListAsync();

            if (relatedList.Count == 0)
            {
                var catId = service.SubCategory?.CategoryId;
                relatedList = await _context.Services
                    .Include(s => s.SubCategory)
                        .ThenInclude(sc => sc!.Category)
                    .Where(s => s.SubCategory != null && s.SubCategory.CategoryId == catId && s.Id != service.Id)
                    .Take(3)
                    .ToListAsync();
            }

            var relatedServices = relatedList.Select(s => new
            {
                id = s.Id,
                image = s.ImageUrl,
                title = s.Name,
                price = s.Price,
                serviceTypeId = s.SubCategory?.Category?.ServiceTypeId ?? 0,
                selectedCategoryName = s.SubCategory?.Category?.CategoryName ?? "",
                isAvailable = true
            }).ToList();

            var detail = new
            {
                id = service.Id,
                title = service.Name,
                price = service.Price,
                serviceTypeId = service.SubCategory?.Category?.ServiceTypeId ?? 0,
                serviceTypeName = service.SubCategory?.Category?.ServiceType?.ServiceName ?? "",
                serviceCategoryName = service.SubCategory?.Category?.CategoryName ?? "",
                categoryName = service.SubCategory?.SubCategoryName ?? "",
                images = new[] { service.ImageUrl },
                inclusions = inclusions,
                exclusions = exclusions,
                relatedServices = relatedServices
            };

            return Ok(ApiResponse<object>.Success(detail));
        }

        [HttpPost("add")]
        public async Task<ActionResult<ApiResponse<Service>>> Add(ServiceRequest request)
        {
            var service = new Service
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Duration = request.Duration,
                SubCategoryId = request.SubCategoryId,
                ImageUrl = request.ImageUrl
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            service.SubCategory = await _context.SubCategories.FindAsync(request.SubCategoryId);

            return Ok(ApiResponse<Service>.Success(service, "Service added successfully"));
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult<ApiResponse<Service>>> Update(int id, ServiceRequest request)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound(ApiResponse<Service>.Failure("Service not found"));

            service.Name = request.Name;
            service.Description = request.Description;
            service.Price = request.Price;
            service.Duration = request.Duration;
            service.SubCategoryId = request.SubCategoryId;
            service.ImageUrl = request.ImageUrl;

            await _context.SaveChangesAsync();

            service.SubCategory = await _context.SubCategories.FindAsync(request.SubCategoryId);

            return Ok(ApiResponse<Service>.Success(service, "Service updated successfully"));
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound(ApiResponse<string>.Failure("Service not found"));

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Success("Service deleted successfully"));
        }

        [HttpGet("by-service-type/{id}")]
        public async Task<ActionResult<ApiResponse<List<Service>>>> GetByServiceType(int id)
        {
            var list = await _context.Services
                .Include(s => s.SubCategory)
                .ThenInclude(sc => sc!.Category)
                .Where(s => s.SubCategory != null && 
                            s.SubCategory.Category != null && 
                            s.SubCategory.Category.ServiceTypeId == id)
                .ToListAsync();

            return Ok(ApiResponse<List<Service>>.Success(list));
        }

        [HttpGet("{id}/availability")]
        public ActionResult<ApiResponse<List<string>>> GetAvailability(int id, [FromQuery] string date)
        {
            // Simple mock availability slots
            var slots = new List<string> { "09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM" };
            return Ok(ApiResponse<List<string>>.Success(slots));
        }

        // Service listing endpoints for Customer app
        [HttpGet("/api/service-list/service-type")]
        public async Task<ActionResult<ApiResponse<object>>> GetServiceListServiceTypes([FromQuery] int serviceTypeId)
        {
            var serviceType = await _context.ServiceTypes.FindAsync(serviceTypeId);
            if (serviceType == null) return NotFound(ApiResponse<object>.Failure("Service type not found"));

            var categories = await _context.Categories
                .Where(c => c.ServiceTypeId == serviceTypeId)
                .ToListAsync();

            var categoryIds = categories.Select(c => c.Id).ToList();

            var subCategories = await _context.SubCategories
                .Where(sc => categoryIds.Contains(sc.CategoryId))
                .ToListAsync();

            var subCategoryIds = subCategories.Select(sc => sc.Id).ToList();

            var totalServicesCount = await _context.Services
                .CountAsync(s => subCategoryIds.Contains(s.SubCategoryId));

            var categoriesList = categories.Select(c => new
            {
                categoryId = c.Id,
                categoryName = c.CategoryName,
                subCategories = subCategories
                    .Where(sc => sc.CategoryId == c.Id)
                    .Select(sc => new
                    {
                        subCategoryId = sc.Id,
                        subCategoryName = sc.SubCategoryName
                    }).ToList()
            }).ToList();

            var result = new
            {
                serviceName = serviceType.ServiceName,
                totalServiceCount = totalServicesCount,
                categories = categoriesList
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpGet("/api/service-list/subcategory")]
        public async Task<ActionResult<ApiResponse<object>>> GetServiceListSubCategories([FromQuery] int subCategoryId)
        {
            var subCategory = await _context.SubCategories.FindAsync(subCategoryId);
            if (subCategory == null) return NotFound(ApiResponse<object>.Failure("SubCategory not found"));

            var servicesList = await _context.Services
                .Where(s => s.SubCategoryId == subCategoryId)
                .ToListAsync();

            var mappedServices = servicesList.Select(s => new
            {
                id = s.Id,
                name = s.Name,
                duration = s.Duration,
                description = s.Description,
                price = s.Price,
                isAvailable = true,
                image = s.ImageUrl
            }).ToList();

            var result = new
            {
                subCategoryName = subCategory.SubCategoryName,
                totalCount = mappedServices.Count,
                services = mappedServices
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpGet("/api/service-list/services")]
        public async Task<ActionResult<ApiResponse<object>>> GetServiceListServices([FromQuery] int? serviceTypeId, [FromQuery] int? categoryId, [FromQuery] int? subcategoryId, [FromQuery] string? term = null)
        {
            var query = _context.Services
                .Include(s => s.SubCategory)
                .ThenInclude(sc => sc!.Category)
                .AsQueryable();

            if (subcategoryId.HasValue && subcategoryId > 0)
            {
                query = query.Where(s => s.SubCategoryId == subcategoryId.Value);
            }
            else if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(s => s.SubCategory != null && s.SubCategory.CategoryId == categoryId.Value);
            }
            else if (serviceTypeId.HasValue && serviceTypeId > 0)
            {
                query = query.Where(s => s.SubCategory != null && 
                                         s.SubCategory.Category != null && 
                                         s.SubCategory.Category.ServiceTypeId == serviceTypeId.Value);
            }

            if (!string.IsNullOrEmpty(term))
            {
                query = query.Where(s => s.Name.ToLower().Contains(term.ToLower()) || 
                                         s.Description.ToLower().Contains(term.ToLower()));
            }

            var list = await query.ToListAsync();

            var mapped = list.Select(s => new
            {
                id = s.Id,
                name = s.Name,
                price = s.Price,
                duration = s.Duration,
                description = s.Description,
                image = s.ImageUrl
            }).ToList();

            return Ok(ApiResponse<object>.Success(mapped));
        }

        // Home endpoints for Customer App
        [HttpGet("/api/home/services-names")]
        public async Task<ActionResult<ApiResponse<object>>> GetHomeServicesNames()
        {
            var names = await _context.Services
                .Select(s => new { id = s.Id, name = s.Name })
                .ToListAsync();
            return Ok(ApiResponse<object>.Success(names));
        }

        [HttpGet("/api/home/service-types")]
        public async Task<ActionResult<ApiResponse<object>>> GetHomeServiceTypes()
        {
            var list = await _context.ServiceTypes.ToListAsync();
            var mapped = list.Select(st => new
            {
                id = st.Id,
                image = st.ImageUrl,
                title = st.ServiceName
            }).ToList();
            return Ok(ApiResponse<object>.Success(mapped));
        }

        [HttpGet("/api/home/popular-services")]
        public async Task<ActionResult<ApiResponse<object>>> GetHomePopularServices()
        {
            var list = await _context.Services
                .Include(s => s.SubCategory)
                    .ThenInclude(sc => sc!.Category)
                .Take(4)
                .ToListAsync();

            var mapped = list.Select(s => new
            {
                id = s.Id,
                image = s.ImageUrl,
                title = s.Name,
                price = s.Price,
                serviceTypeId = s.SubCategory?.Category?.ServiceTypeId ?? 0,
                selectedCategoryName = s.SubCategory?.Category?.CategoryName ?? "",
                isAvailable = true
            }).ToList();

            return Ok(ApiResponse<object>.Success(mapped));
        }

        [HttpGet("/api/home/all-services")]
        public async Task<ActionResult<ApiResponse<object>>> GetHomeAllServices()
        {
            var list = await _context.Services
                .Include(s => s.SubCategory)
                    .ThenInclude(sc => sc!.Category)
                .ToListAsync();

            var mapped = list.Select(s => new
            {
                id = s.Id,
                image = s.ImageUrl,
                title = s.Name,
                price = s.Price,
                serviceTypeId = s.SubCategory?.Category?.ServiceTypeId ?? 0,
                selectedCategoryName = s.SubCategory?.Category?.CategoryName ?? "",
                isAvailable = true
            }).ToList();

            return Ok(ApiResponse<object>.Success(mapped));
        }

        [HttpGet("/api/home/dashboard-counts")]
        public async Task<ActionResult<ApiResponse<object>>> GetHomeDashboardCounts()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.Role == "Customer");
            var totalServices = await _context.Services.CountAsync();

            return Ok(ApiResponse<object>.Success(new
            {
                totalUsers = totalUsers,
                totalServices = totalServices
            }));
        }
    }
}
