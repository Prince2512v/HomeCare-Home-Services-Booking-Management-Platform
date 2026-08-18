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
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public CustomerController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("list")]
        public async Task<ActionResult<ApiResponse<object>>> GetList(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] int? bookingMin = null,
            [FromQuery] int? bookingMax = null,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null)
        {
            var customers = await _context.Users.Where(u => u.Role == "Customer").ToListAsync();
            var bookings = await _context.Bookings.ToListAsync();

            var mapped = customers.Select(c =>
            {
                var custBookings = bookings.Where(b => b.UserId == c.Id).ToList();
                return new
                {
                    id = c.Id,
                    name = c.Name,
                    mobileNumber = c.Phone,
                    email = c.Email,
                    pendingBookings = custBookings.Count(b => b.Status == "Pending" || b.Status == "Assigned"),
                    totalBookings = custBookings.Count,
                    status = c.IsActive ? "Active" : "Inactive"
                };
            }).ToList();

            // Filter by status
            if (!string.IsNullOrEmpty(status))
            {
                mapped = mapped.Where(c => c.status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Filter by booking count range
            if (bookingMin.HasValue)
                mapped = mapped.Where(c => c.totalBookings >= bookingMin.Value).ToList();
            if (bookingMax.HasValue)
                mapped = mapped.Where(c => c.totalBookings <= bookingMax.Value).ToList();

            // Compute filterMeta before pagination
            var maxBookingCount = mapped.Any() ? mapped.Max(c => c.totalBookings) : 0;

            // Sort
            if (!string.IsNullOrEmpty(sortField))
            {
                var desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
                mapped = sortField.ToLower() switch
                {
                    "name" => desc ? mapped.OrderByDescending(c => c.name).ToList() : mapped.OrderBy(c => c.name).ToList(),
                    "totalbookings" => desc ? mapped.OrderByDescending(c => c.totalBookings).ToList() : mapped.OrderBy(c => c.totalBookings).ToList(),
                    "pendingbookings" => desc ? mapped.OrderByDescending(c => c.pendingBookings).ToList() : mapped.OrderBy(c => c.pendingBookings).ToList(),
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
                totalRecords,
                filterMeta = new
                {
                    maxBookingCount
                }
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
        {
            var customer = await _context.Users.FindAsync(id);
            if (customer == null || customer.Role != "Customer")
            {
                return NotFound(ApiResponse<object>.Failure("Customer not found"));
            }

            var detail = new
            {
                id = customer.Id,
                name = customer.Name,
                mobileNumber = customer.Phone,
                email = customer.Email,
                status = customer.IsActive ? "Active" : "Inactive"
            };

            return Ok(ApiResponse<object>.Success(detail));
        }

        [HttpGet("{id}/bookings")]
        public async Task<ActionResult<ApiResponse<object>>> GetBookings(
            int id,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null,
            [FromQuery] int? serviceTypeId = null,
            [FromQuery] string? date = null,
            [FromQuery] string? time = null,
            [FromQuery] decimal? amountMin = null,
            [FromQuery] decimal? amountMax = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] string? status = null)
        {
            var query = _context.Bookings
                .Include(b => b.Service)
                    .ThenInclude(s => s!.SubCategory)
                        .ThenInclude(sc => sc!.Category)
                            .ThenInclude(c => c!.ServiceType)
                .Include(b => b.ServicePartner)
                    .ThenInclude(sp => sp!.User)
                .Where(b => b.UserId == id);

            var bookingList = await query.ToListAsync();

            var mapped = bookingList.Select(b => new
            {
                bookingId = b.Id,
                serviceId = b.ServiceId,
                serviceName = b.Service?.Name ?? "",
                serviceType = b.Service?.SubCategory?.Category?.ServiceType?.ServiceName ?? "",
                serviceTypeId = b.Service?.SubCategory?.Category?.ServiceTypeId,
                address = b.Address,
                bookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                bookingTime = b.SlotTime,
                bookingAmount = b.TotalAmount,
                paymentMethod = b.PaymentMethod,
                status = b.Status,
                assignedPartnerId = b.ServicePartnerId,
                assignedExpertName = b.ServicePartner?.User?.Name,
                assignedExpertImageUrl = b.ServicePartner?.ProfileImageUrl,
                canChangeExpert = b.Status == "Pending" || b.Status == "Assigned",
                canComplete = b.Status == "Assigned",
                canCancel = b.Status == "Pending" || b.Status == "Assigned",
                canDelete = b.Status == "Completed" || b.Status == "Cancelled"
            }).ToList();

            // Filters
            if (serviceTypeId.HasValue)
                mapped = mapped.Where(b => b.serviceTypeId == serviceTypeId.Value).ToList();
            if (!string.IsNullOrEmpty(status))
                mapped = mapped.Where(b => b.status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            if (!string.IsNullOrEmpty(paymentMethod))
                mapped = mapped.Where(b => b.paymentMethod.Equals(paymentMethod, StringComparison.OrdinalIgnoreCase)).ToList();
            if (amountMin.HasValue)
                mapped = mapped.Where(b => b.bookingAmount >= amountMin.Value).ToList();
            if (amountMax.HasValue)
                mapped = mapped.Where(b => b.bookingAmount <= amountMax.Value).ToList();

            var maxAmount = mapped.Any() ? (decimal?)mapped.Max(b => b.bookingAmount) : null;
            var totalRecords = mapped.Count;

            if (pageSize > 0 && pageNumber > 0)
                mapped = mapped.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            var result = new
            {
                records = mapped,
                totalRecords,
                filterMeta = new { maxAmount }
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateCustomerRequest request)
        {
            var customer = new User
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.MobileNumber,
                PasswordHash = "Customer@123",
                Role = "Customer",
                IsActive = true
            };

            _context.Users.Add(customer);
            await _context.SaveChangesAsync();

            var response = new
            {
                id = customer.Id,
                name = customer.Name,
                mobileNumber = customer.Phone,
                email = customer.Email,
                pendingBookings = 0,
                totalBookings = 0,
                status = "Active"
            };

            return Ok(ApiResponse<object>.Success(response, "Customer created successfully"));
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateStatus(int id)
        {
            var customer = await _context.Users.FindAsync(id);
            if (customer == null || customer.Role != "Customer")
            {
                return NotFound(ApiResponse<bool>.Failure("Customer not found"));
            }

            customer.IsActive = !customer.IsActive;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Success(true, "Customer status updated"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var customer = await _context.Users.FindAsync(id);
            if (customer == null || customer.Role != "Customer")
            {
                return NotFound(ApiResponse<bool>.Failure("Customer not found"));
            }

            _context.Users.Remove(customer);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Success(true, "Customer deleted successfully"));
        }
    }

    public class CreateCustomerRequest
    {
        public string Name { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
