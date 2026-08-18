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
    [Route("api/subcategories")]
    public class SubCategoryController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public SubCategoryController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("get")]
        public async Task<ActionResult<ApiResponse<object>>> Get([FromQuery] int? categoryId)
        {
            var query = _context.SubCategories
                .Include(sc => sc.Category)
                .ThenInclude(c => c!.ServiceType)
                .AsQueryable();
            if (categoryId.HasValue)
                query = query.Where(sc => sc.CategoryId == categoryId.Value);
            var list = await query.ToListAsync();
            var result = new { totalRecords = list.Count, records = list };
            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpPost("add")]
        public async Task<ActionResult<ApiResponse<SubCategory>>> Add(SubCategoryRequest request)
        {
            var subCategory = new SubCategory
            {
                SubCategoryName = request.SubCategoryName,
                CategoryId = request.CategoryId
            };

            _context.SubCategories.Add(subCategory);
            await _context.SaveChangesAsync();

            // Load relations
            subCategory.Category = await _context.Categories
                .Include(c => c.ServiceType)
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

            return Ok(ApiResponse<SubCategory>.Success(subCategory, "Subcategory added successfully"));
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var subCategory = await _context.SubCategories.FindAsync(id);
            if (subCategory == null) return NotFound(ApiResponse<string>.Failure("Subcategory not found"));

            _context.SubCategories.Remove(subCategory);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Success("Subcategory deleted successfully"));
        }
    }
}
