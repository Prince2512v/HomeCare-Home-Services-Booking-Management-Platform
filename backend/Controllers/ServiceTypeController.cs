using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceTypeController : ControllerBase
    {
        private readonly HomeCareDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ServiceTypeController(HomeCareDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet("get")]
        public async Task<ActionResult<ApiResponse<object>>> GetAll()
        {
            var list = await _context.ServiceTypes.ToListAsync();
            var result = new { totalRecords = list.Count, records = list };
            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpGet("get/{id}")]
        public async Task<ActionResult<ApiResponse<ServiceType>>> GetById(int id)
        {
            var item = await _context.ServiceTypes.FindAsync(id);
            if (item == null) return NotFound(ApiResponse<ServiceType>.Failure("ServiceType not found"));
            return Ok(ApiResponse<ServiceType>.Success(item));
        }

        [HttpPost("add")]
        public async Task<ActionResult<ApiResponse<ServiceType>>> Add([FromForm] string serviceName, [FromForm] IFormFile? image)
        {
            var serviceType = new ServiceType
            {
                ServiceName = serviceName,
                ImageUrl = string.Empty
            };

            if (image != null && image.Length > 0)
            {
                serviceType.ImageUrl = await SaveImageAsync(image);
            }

            _context.ServiceTypes.Add(serviceType);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<ServiceType>.Success(serviceType, "ServiceType added successfully"));
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult<ApiResponse<ServiceType>>> Update(int id, [FromForm] string serviceName, [FromForm] IFormFile? image)
        {
            var item = await _context.ServiceTypes.FindAsync(id);
            if (item == null) return NotFound(ApiResponse<ServiceType>.Failure("ServiceType not found"));

            item.ServiceName = serviceName;

            if (image != null && image.Length > 0)
            {
                item.ImageUrl = await SaveImageAsync(image);
            }

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<ServiceType>.Success(item, "ServiceType updated successfully"));
        }

        private async Task<string> SaveImageAsync(IFormFile file)
        {
            var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "service-types");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/service-types/{fileName}";
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var item = await _context.ServiceTypes.FindAsync(id);
            if (item == null) return NotFound(ApiResponse<string>.Failure("ServiceType not found"));

            _context.ServiceTypes.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Success("ServiceType deleted successfully"));
        }

        [HttpGet("{id}/image")]
        public async Task<IActionResult> GetImage(int id)
        {
            var serviceType = await _context.ServiceTypes.FindAsync(id);
            if (serviceType == null)
                return NotFound();

            // If there's a saved image, serve it from disk
            if (!string.IsNullOrEmpty(serviceType.ImageUrl) && serviceType.ImageUrl.StartsWith("/uploads/"))
            {
                var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", serviceType.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    var ext = Path.GetExtension(filePath).ToLowerInvariant();
                    var contentType = ext switch
                    {
                        ".png" => "image/png",
                        ".jpg" or ".jpeg" => "image/jpeg",
                        ".svg" => "image/svg+xml",
                        ".webp" => "image/webp",
                        _ => "application/octet-stream"
                    };
                    return PhysicalFile(filePath, contentType);
                }
            }

            // Return a placeholder SVG with the first letter of the service name
            var letter = string.IsNullOrEmpty(serviceType.ServiceName) ? "?" : serviceType.ServiceName[0].ToString().ToUpper();
            var svg = $@"<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>
                <rect width='48' height='48' rx='8' fill='#6C63FF'/>
                <text x='24' y='32' font-family='Arial,sans-serif' font-size='22' font-weight='bold' fill='white' text-anchor='middle'>{letter}</text>
            </svg>";
            return Content(svg, "image/svg+xml");
        }

        [HttpGet("with-booking-count")]
        [Route("/api/service-type/with-booking-count")]
        public async Task<ActionResult<ApiResponse<List<object>>>> GetWithBookingCount()
        {
            var list = await _context.ServiceTypes.ToListAsync();
            var result = new List<object>();

            foreach (var st in list)
            {
                var bookingCount = await _context.Bookings
                    .Include(b => b.Service)
                    .ThenInclude(s => s!.SubCategory)
                    .ThenInclude(sc => sc!.Category)
                    .CountAsync(b => b.Service != null && 
                                     b.Service.SubCategory != null && 
                                     b.Service.SubCategory.Category != null && 
                                     b.Service.SubCategory.Category.ServiceTypeId == st.Id);

                result.Add(new
                {
                    id = st.Id,
                    title = st.ServiceName,
                    image = st.ImageUrl,
                    totalBookings = bookingCount
                });
            }

            return Ok(ApiResponse<List<object>>.Success(result));
        }
    }
}
