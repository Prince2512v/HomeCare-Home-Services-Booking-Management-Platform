using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/service-partners")]
    public class ServicePartnersController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public ServicePartnersController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("list")]
        public async Task<ActionResult<ApiResponse<object>>> GetList(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? serviceTypeName = null,
            [FromQuery] int? jobsCompletedMin = null,
            [FromQuery] int? jobsCompletedMax = null,
            [FromQuery] int? status = null,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null)
        {
            var partners = await _context.ServicePartners
                .Include(sp => sp.User)
                .ToListAsync();

            var bookings = await _context.Bookings.ToListAsync();
            var addresses = await _context.Addresses.ToListAsync();
            var servicesList = await _context.Services.ToListAsync();

            var mapped = new List<object>();
            foreach (var sp in partners)
            {
                if (sp.User == null) continue;

                var addr = addresses.FirstOrDefault(a => a.UserId == sp.UserId);
                var serviceIds = string.IsNullOrEmpty(sp.AssignedServices)
                    ? new List<int>()
                    : sp.AssignedServices.Split(',').Select(int.Parse).ToList();

                var assignedServices = servicesList.Where(s => serviceIds.Contains(s.Id)).ToList();
                var job = string.Join(", ", assignedServices.Select(s => s.Name));
                if (string.IsNullOrEmpty(job)) job = "General Expert";

                var jobsCompleted = bookings.Count(b => b.ServicePartnerId == sp.Id && b.Status == "Completed");

                string displayStatus = sp.Status; // Pending, Rejected
                if (sp.Status == "Approved")
                {
                    displayStatus = sp.IsActive ? "Active" : "Inactive";
                }

                mapped.Add(new
                {
                    id = sp.Id,
                    name = sp.User.Name,
                    mobileNumber = sp.User.Phone,
                    email = sp.User.Email,
                    address = addr?.FullAddress ?? "Not Provided",
                    job = job,
                    jobsCompleted = jobsCompleted,
                    status = displayStatus
                });
            }

            // Apply filters
            if (!string.IsNullOrEmpty(serviceTypeName))
            {
                mapped = mapped.Where(m =>
                {
                    var jobVal = m.GetType().GetProperty("job")?.GetValue(m) as string;
                    return jobVal != null && jobVal.Contains(serviceTypeName, StringComparison.OrdinalIgnoreCase);
                }).ToList();
            }

            if (jobsCompletedMin.HasValue)
            {
                mapped = mapped.Where(m =>
                {
                    var jc = (int)(m.GetType().GetProperty("jobsCompleted")?.GetValue(m) ?? 0);
                    return jc >= jobsCompletedMin.Value;
                }).ToList();
            }

            if (jobsCompletedMax.HasValue)
            {
                mapped = mapped.Where(m =>
                {
                    var jc = (int)(m.GetType().GetProperty("jobsCompleted")?.GetValue(m) ?? 0);
                    return jc <= jobsCompletedMax.Value;
                }).ToList();
            }

            if (status.HasValue)
            {
                // status values: 1=Active, 0=Inactive, 2=Pending, 3=Rejected
                string targetStatus = status.Value switch
                {
                    1 => "Active",
                    0 => "Inactive",
                    2 => "Pending",
                    3 => "Rejected",
                    _ => ""
                };

                if (!string.IsNullOrEmpty(targetStatus))
                {
                    mapped = mapped.Where(m =>
                    {
                        var s = m.GetType().GetProperty("status")?.GetValue(m) as string;
                        return s != null && s.Equals(targetStatus, StringComparison.OrdinalIgnoreCase);
                    }).ToList();
                }
            }

            // Compute filterMeta before pagination
            var maxBookedServices = mapped.Any()
                ? mapped.Max(m => (int)(m.GetType().GetProperty("jobsCompleted")?.GetValue(m) ?? 0))
                : 0;

            // Apply Sorting
            if (!string.IsNullOrEmpty(sortField))
            {
                var desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
                mapped = sortField.ToLower() switch
                {
                    "name" => desc 
                        ? mapped.OrderByDescending(m => m.GetType().GetProperty("name")?.GetValue(m)).ToList() 
                        : mapped.OrderBy(m => m.GetType().GetProperty("name")?.GetValue(m)).ToList(),
                    "jobscompleted" => desc 
                        ? mapped.OrderByDescending(m => m.GetType().GetProperty("jobsCompleted")?.GetValue(m)).ToList() 
                        : mapped.OrderBy(m => m.GetType().GetProperty("jobsCompleted")?.GetValue(m)).ToList(),
                    "id" => desc 
                        ? mapped.OrderByDescending(m => m.GetType().GetProperty("id")?.GetValue(m)).ToList() 
                        : mapped.OrderBy(m => m.GetType().GetProperty("id")?.GetValue(m)).ToList(),
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
                    maxBookedServices
                }
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
        {
            var sp = await _context.ServicePartners
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (sp == null || sp.User == null)
                return NotFound(ApiResponse<object>.Failure("Service partner not found"));

            var addr = await _context.Addresses.FirstOrDefaultAsync(a => a.UserId == sp.UserId);

            // Get assigned services
            var serviceIds = string.IsNullOrEmpty(sp.AssignedServices)
                ? new List<int>()
                : sp.AssignedServices.Split(',').Select(int.Parse).ToList();

            var services = await _context.Services
                .Include(s => s.SubCategory)
                    .ThenInclude(sc => sc!.Category)
                .Where(s => serviceIds.Contains(s.Id))
                .ToListAsync();

            var servicesOffered = services.Select(s => new
            {
                subCategoryId = s.SubCategoryId,
                subCategoryName = s.SubCategory?.SubCategoryName ?? ""
            }).DistinctBy(s => s.subCategoryId).ToList();

            var skills = services.Select(s => new
            {
                categoryId = s.SubCategory?.CategoryId ?? 0,
                categoryName = s.SubCategory?.Category?.CategoryName ?? ""
            }).Where(s => s.categoryId != 0).DistinctBy(s => s.categoryId).ToList();

            var languages = string.IsNullOrEmpty(sp.Language)
                ? new List<string>()
                : sp.Language.Split(',').Select(l => l.Trim()).ToList();

            var languagesSpoken = languages.Select((lang, idx) => new
            {
                languageId = idx + 1,
                languageName = lang,
                proficiency = "Fluent"
            }).ToList();

            var displayStatus = sp.Status;
            if (sp.Status == "Approved")
            {
                displayStatus = sp.IsActive ? "Active" : "Inactive";
            }

            var detail = new
            {
                id = sp.Id,
                fullName = sp.User.Name,
                mobileNumber = sp.User.Phone,
                email = sp.User.Email,
                residentialAddress = addr?.FullAddress ?? "Not Provided",
                jobTitle = services.Any() ? services[0].Name : "General Expert",
                totalWorkExperienceYears = 3, // Fallback/Dummy value
                verificationStatus = sp.Status, // Pending, Approved, Rejected
                status = displayStatus,
                profileImageUrl = string.IsNullOrEmpty(sp.ProfileImageUrl) ? null : sp.ProfileImageUrl,
                skills = skills,
                servicesOffered = servicesOffered,
                languagesSpoken = languagesSpoken,
                previousExperiences = new List<object>(),
                attachments = string.IsNullOrEmpty(sp.AttachmentUrl) ? new List<object>() : new List<object>
                {
                    new
                    {
                        id = 1,
                        fileName = Path.GetFileName(sp.AttachmentUrl),
                        fileUrl = sp.AttachmentUrl,
                        fileType = "PDF",
                        fileSizeKb = 150,
                        documentLabel = "Resume / Identification"
                    }
                }
            };

            return Ok(ApiResponse<object>.Success(detail));
        }

        [HttpPatch("{id}/approve")]
        public async Task<ActionResult<ApiResponse<object>>> Approve(int id)
        {
            var partner = await _context.ServicePartners.FindAsync(id);
            if (partner == null) return NotFound(ApiResponse<object>.Failure("Service Partner not found"));

            partner.Status = "Approved";
            await _context.SaveChangesAsync();

            var response = new
            {
                id = partner.Id,
                verificationStatus = partner.Status,
                status = partner.IsActive ? "Active" : "Inactive",
                message = "Service partner approved successfully"
            };

            return Ok(ApiResponse<object>.Success(response, "Service partner approved successfully"));
        }

        [HttpPatch("{id}/reject")]
        public async Task<ActionResult<ApiResponse<object>>> Reject(int id, [FromBody] RejectRequestModel? request)
        {
            var partner = await _context.ServicePartners.FindAsync(id);
            if (partner == null) return NotFound(ApiResponse<object>.Failure("Service Partner not found"));

            partner.Status = "Rejected";
            await _context.SaveChangesAsync();

            var response = new
            {
                id = partner.Id,
                verificationStatus = partner.Status,
                status = "Rejected",
                message = "Service partner rejected successfully"
            };

            return Ok(ApiResponse<object>.Success(response, "Service partner rejected successfully"));
        }

        [HttpGet("{id}/assigned-services")]
        public async Task<ActionResult<ApiResponse<object>>> GetAssignedServices(
            int id,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? date = null,
            [FromQuery] string? time = null,
            [FromQuery] string? serviceStatus = null)
        {
            var partner = await _context.ServicePartners.FindAsync(id);
            if (partner == null) return NotFound(ApiResponse<object>.Failure("Service Partner not found"));

            var query = _context.Bookings
                .Include(b => b.Service)
                .Include(b => b.User)
                .Where(b => b.ServicePartnerId == partner.Id);

            var bookingList = await query.ToListAsync();

            var mapped = bookingList.Select(b => new
            {
                bookingId = b.Id,
                serviceId = b.ServiceId,
                serviceName = b.Service?.Name ?? "",
                customerName = b.User?.Name ?? "",
                dateAndTime = b.BookingDate.ToString("yyyy-MM-dd") + " " + b.SlotTime,
                serviceAddress = b.Address,
                serviceStatus = b.Status
            }).ToList();

            // Filters
            if (!string.IsNullOrEmpty(serviceStatus))
                mapped = mapped.Where(x => x.serviceStatus.Equals(serviceStatus, StringComparison.OrdinalIgnoreCase)).ToList();

            var totalRecords = mapped.Count;

            if (pageSize > 0 && pageNumber > 0)
                mapped = mapped.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            var result = new
            {
                records = mapped,
                totalRecords
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpPatch("{id}/toggle-status")]
        public async Task<ActionResult<ApiResponse<bool>>> ToggleStatus(int id)
        {
            var partner = await _context.ServicePartners.FindAsync(id);
            if (partner == null) return NotFound(ApiResponse<bool>.Failure("Service Partner not found"));

            partner.IsActive = !partner.IsActive;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Success(true, $"Service partner status toggled successfully"));
        }

        [HttpDelete("{id}/delete")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var partner = await _context.ServicePartners.FindAsync(id);
            if (partner == null) return NotFound(ApiResponse<bool>.Failure("Service Partner not found"));

            _context.ServicePartners.Remove(partner);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Success(true, "Service partner deleted successfully"));
        }

        // Apply endpoint for Customers
        [HttpPost("/api/service-partner/apply")]
        public async Task<ActionResult<ApiResponse<ServicePartner>>> Apply(ServicePartnerApplyRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    Phone = request.Phone,
                    Role = "ServicePartner",
                    IsActive = true
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                user.Role = "ServicePartner"; // Elevate to expert
            }

            var partner = new ServicePartner
            {
                UserId = user.Id,
                Status = "Pending",
                Language = request.Language,
                ProfileImageUrl = request.ProfileImageUrl,
                AttachmentUrl = request.AttachmentUrl,
                AssignedServices = request.AssignedServices
            };

            _context.ServicePartners.Add(partner);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<ServicePartner>.Success(partner, "Application submitted successfully"));
        }

        [HttpPost("upload-attachment")]
        [HttpPost("/api/service-partner/upload-attachment")]
        [HttpPost("/api/service-partners/upload-attachment")]
        public ActionResult<ApiResponse<string>> UploadAttachment()
        {
            return Ok(ApiResponse<string>.Success("/assets/dummy-attachment.pdf", "Attachment uploaded successfully"));
        }

        [HttpPost("/api/service-partner/upload-profile-image")]
        public ActionResult<ApiResponse<string>> UploadProfileImage()
        {
            return Ok(ApiResponse<string>.Success("/assets/dummy-profile.png", "Profile image uploaded successfully"));
        }

        [HttpGet("/api/language")]
        public ActionResult<ApiResponse<List<object>>> GetLanguages()
        {
            var languages = new List<object>
            {
                new { Id = 1, Name = "English" },
                new { Id = 2, Name = "Spanish" },
                new { Id = 3, Name = "French" },
                new { Id = 4, Name = "German" },
                new { Id = 5, Name = "Hindi" }
            };
            return Ok(ApiResponse<List<object>>.Success(languages));
        }

        [HttpGet("/api/service-partner/profile-image/{name}")]
        public ActionResult GetProfileImage(string name)
        {
            return File(new byte[] { 0 }, "image/png");
        }

        [HttpGet("{id}/attachments/{attachmentId}/download")]
        public ActionResult DownloadAttachment(int id, string attachmentId)
        {
            return File(new byte[] { 0 }, "application/pdf", "attachment.pdf");
        }
    }

    public class RejectRequestModel
    {
        public string? RejectionReason { get; set; }
    }
}

