using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/support-tickets")]
    public class SupportTicketsController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public SupportTicketsController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpPost("submit")]
        public async Task<ActionResult<ApiResponse<SupportTicket>>> Submit(CustomerSupportTicketRequest request)
        {
            // Build full name from firstName + lastName (customer frontend sends them separately)
            var fullName = $"{request.FirstName} {request.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(fullName))
                fullName = request.Name; // Fallback for old-style requests with a single Name field

            var ticket = new SupportTicket
            {
                Name = string.IsNullOrWhiteSpace(fullName) ? "Unknown" : fullName,
                Email = request.Email,
                ContactNumber = request.ContactNumber,
                Subject = request.Subject ?? "General Inquiry",
                Message = request.Description ?? request.Message ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<SupportTicket>.Success(ticket, "Support ticket submitted successfully. We will contact you soon."));
        }

        [HttpGet("list")]
        public async Task<ActionResult<ApiResponse<object>>> GetList(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? userName = null,
            [FromQuery] string? submittedAt = null,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null)
        {
            var tickets = await _context.SupportTickets.ToListAsync();
            var users = await _context.Users.ToListAsync();

            var mapped = tickets.Select(t =>
            {
                // Use the contact number stored with the ticket; fall back to the user's phone
                var contactNumber = !string.IsNullOrEmpty(t.ContactNumber)
                    ? t.ContactNumber
                    : users.FirstOrDefault(u => u.Email.Equals(t.Email, StringComparison.OrdinalIgnoreCase))?.Phone ?? "";

                return new
                {
                    id = t.Id,
                    userName = t.Name,
                    email = t.Email,
                    contactNumber = contactNumber,
                    description = string.IsNullOrEmpty(t.Subject) || t.Subject == "General Inquiry" ? t.Message : $"{t.Subject}: {t.Message}",
                    submittedAt = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                };
            }).ToList();

            if (!string.IsNullOrEmpty(userName))
            {
                mapped = mapped.Where(t => t.userName.Contains(userName, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(submittedAt))
            {
                mapped = mapped.Where(t => t.submittedAt.Contains(submittedAt)).ToList();
            }

            if (!string.IsNullOrEmpty(sortField))
            {
                var desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
                mapped = sortField.ToLower() switch
                {
                    "username" => desc ? mapped.OrderByDescending(t => t.userName).ToList() : mapped.OrderBy(t => t.userName).ToList(),
                    "submittedat" => desc ? mapped.OrderByDescending(t => t.submittedAt).ToList() : mapped.OrderBy(t => t.submittedAt).ToList(),
                    _ => mapped
                };
            }

            var totalRecords = mapped.Count;

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
    }
}
