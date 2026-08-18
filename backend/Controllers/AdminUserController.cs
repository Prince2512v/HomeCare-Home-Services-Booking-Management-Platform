using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminUserController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public AdminUserController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("list")]
        public async Task<ActionResult<ApiResponse<object>>> GetList(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool? isSuperAdmin = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null)
        {
            var query = _context.Users.Where(u => u.Role == "Admin" || u.Role == "SuperAdmin").AsQueryable();

            if (isSuperAdmin.HasValue)
            {
                var roleFilter = isSuperAdmin.Value ? "SuperAdmin" : "Admin";
                query = query.Where(u => u.Role == roleFilter);
            }

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            var list = await query.ToListAsync();

            var mapped = list.Select(u => new
            {
                id = u.Id,
                name = u.Name,
                email = u.Email,
                mobileNumber = u.Phone,
                role = u.Role,
                isActive = u.IsActive
            }).ToList();

            // Apply Sorting
            if (!string.IsNullOrEmpty(sortField))
            {
                var desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
                mapped = sortField.ToLower() switch
                {
                    "name" => desc ? mapped.OrderByDescending(u => u.name).ToList() : mapped.OrderBy(u => u.name).ToList(),
                    "email" => desc ? mapped.OrderByDescending(u => u.email).ToList() : mapped.OrderBy(u => u.email).ToList(),
                    "id" => desc ? mapped.OrderByDescending(u => u.id).ToList() : mapped.OrderBy(u => u.id).ToList(),
                    _ => mapped
                };
            }

            var totalRecords = mapped.Count;

            // Paginate
            if (pageSize > 0 && pageNumber > 0)
            {
                mapped = mapped.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            }

            var result = new
            {
                records = mapped,
                totalRecords
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
        {
            var u = await _context.Users.FindAsync(id);
            if (u == null || (u.Role != "Admin" && u.Role != "SuperAdmin"))
            {
                return NotFound(ApiResponse<object>.Failure("Admin user not found"));
            }

            var detail = new
            {
                id = u.Id,
                name = u.Name,
                email = u.Email,
                mobileNumber = u.Phone,
                role = u.Role,
                isActive = u.IsActive
            };

            return Ok(ApiResponse<object>.Success(detail));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateAdminUserRequest request)
        {
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.MobileNumber,
                Role = request.IsSuperAdmin ? "SuperAdmin" : "Admin",
                PasswordHash = string.IsNullOrEmpty(request.Password) ? "admin123" : request.Password,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var detail = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                mobileNumber = user.Phone,
                role = user.Role,
                isActive = user.IsActive
            };

            return Ok(ApiResponse<object>.Success(detail, "Admin user created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateAdminUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || (user.Role != "Admin" && user.Role != "SuperAdmin"))
            {
                return NotFound(ApiResponse<object>.Failure("Admin user not found"));
            }

            user.Name = request.Name;
            user.Email = request.Email;
            user.Phone = request.MobileNumber;
            user.Role = request.IsSuperAdmin ? "SuperAdmin" : "Admin";
            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = request.Password;
            }

            await _context.SaveChangesAsync();

            var detail = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                mobileNumber = user.Phone,
                role = user.Role,
                isActive = user.IsActive
            };

            return Ok(ApiResponse<object>.Success(detail, "Admin user updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || (user.Role != "Admin" && user.Role != "SuperAdmin"))
            {
                return NotFound(ApiResponse<bool>.Failure("Admin user not found"));
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Success(true, "Admin user deleted successfully"));
        }

        [HttpPatch("change-password")]
        public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangeAdminPasswordRequest request)
        {
            var user = await _context.Users.FindAsync(request.TargetAdminId);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Failure("User not found"));
            }

            user.PasswordHash = request.Password;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Success(null, "Password changed successfully"));
        }
    }

    public class CreateAdminUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsSuperAdmin { get; set; }
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateAdminUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsSuperAdmin { get; set; }
        public string? Password { get; set; }
    }

    public class ChangeAdminPasswordRequest
    {
        public int TargetAdminId { get; set; }
        public string Password { get; set; } = string.Empty;
    }
}

