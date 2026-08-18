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
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public CategoryController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("get")]
        public async Task<ActionResult<ApiResponse<object>>> Get([FromQuery] int? serviceTypeId)
        {
            var query = _context.Categories.Include(c => c.ServiceType).AsQueryable();
            if (serviceTypeId.HasValue)
                query = query.Where(c => c.ServiceTypeId == serviceTypeId.Value);
            var list = await query.ToListAsync();
            var result = new { totalRecords = list.Count, records = list };
            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpPost("add")]
        public async Task<ActionResult<ApiResponse<Category>>> Add(CategoryRequest request)
        {
            var category = new Category
            {
                CategoryName = request.CategoryName,
                ServiceTypeId = request.ServiceTypeId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Load related ServiceType
            category.ServiceType = await _context.ServiceTypes.FindAsync(request.ServiceTypeId);

            return Ok(ApiResponse<Category>.Success(category, "Category added successfully"));
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(ApiResponse<string>.Failure("Category not found"));

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Success("Category deleted successfully"));
        }
    }
}
