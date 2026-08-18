using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Models;
using System;

namespace HomeCare_BE.Data
{
    public class HomeCareDbContext : DbContext
    {
        public HomeCareDbContext(DbContextOptions<HomeCareDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ServicePartner> ServicePartners { get; set; }
        public DbSet<ServiceType> ServiceTypes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Otp> Otps { get; set; }
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<Offer> Offers { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<UserAddress> Addresses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure cascade deletes or constraints if needed
            modelBuilder.Entity<Category>()
                .HasOne(c => c.ServiceType)
                .WithMany()
                .HasForeignKey(c => c.ServiceTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SubCategory>()
                .HasOne(sc => sc.Category)
                .WithMany()
                .HasForeignKey(sc => sc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Service>()
                .HasOne(s => s.SubCategory)
                .WithMany()
                .HasForeignKey(s => s.SubCategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed initial data
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Name = "Admin User", Email = "admin@homecare.com", Phone = "9876543210", PasswordHash = "Admin@123", Role = "Admin" },
                new User { Id = 2, Name = "John Customer", Email = "john@customer.com", Phone = "1234567890", PasswordHash = "John@123", Role = "Customer" },
                new User { Id = 3, Name = "David Expert", Email = "david@expert.com", Phone = "5555555555", PasswordHash = "Expert@123", Role = "ServicePartner" },
                new User { Id = 4, Name = "User Admin", Email = "22bmiit117@gmail.com", Phone = "1172200000", PasswordHash = "Admin@123", Role = "Admin" }
            );

            modelBuilder.Entity<ServicePartner>().HasData(
                new ServicePartner 
                { 
                    Id = 1, 
                    UserId = 3, 
                    Status = "Approved", 
                    Language = "English, Spanish", 
                    ProfileImageUrl = "/assets/expert1.jpg", 
                    AttachmentUrl = "/assets/resume.pdf", 
                    IsActive = true, 
                    Rating = 4.8,
                    AssignedServices = "1,2,3"
                }
            );

            modelBuilder.Entity<ServiceType>().HasData(
                new ServiceType { Id = 1, ServiceName = "Cleaning", ImageUrl = "/assets/cleaning.png" },
                new ServiceType { Id = 2, ServiceName = "Appliance Repair", ImageUrl = "/assets/appliance.png" },
                new ServiceType { Id = 3, ServiceName = "Painting", ImageUrl = "/assets/painting.png" }
            );

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, CategoryName = "Home Cleaning", ServiceTypeId = 1 },
                new Category { Id = 2, CategoryName = "Kitchen Cleaning", ServiceTypeId = 1 },
                new Category { Id = 3, CategoryName = "AC Repair", ServiceTypeId = 2 },
                new Category { Id = 4, CategoryName = "Home Painting", ServiceTypeId = 3 },
                new Category { Id = 5, CategoryName = "Home Appliances", ServiceTypeId = 2 }
            );

            modelBuilder.Entity<SubCategory>().HasData(
                new SubCategory { Id = 1, SubCategoryName = "Full Home deep cleaning", CategoryId = 1 },
                new SubCategory { Id = 2, SubCategoryName = "Sofa Cleaning", CategoryId = 1 },
                new SubCategory { Id = 3, SubCategoryName = "Split AC Service", CategoryId = 3 },
                new SubCategory { Id = 4, SubCategoryName = "Kitchen Deep Cleaning", CategoryId = 2 },
                new SubCategory { Id = 5, SubCategoryName = "Chimney Cleaning", CategoryId = 2 },
                new SubCategory { Id = 6, SubCategoryName = "Interior Wall Painting", CategoryId = 4 },
                new SubCategory { Id = 7, SubCategoryName = "Exterior Wall Painting", CategoryId = 4 },
                new SubCategory { Id = 8, SubCategoryName = "Bathroom Deep Cleaning", CategoryId = 1 },
                new SubCategory { Id = 9, SubCategoryName = "Carpet & Mat Cleaning", CategoryId = 1 },
                new SubCategory { Id = 10, SubCategoryName = "Refrigerator Repair", CategoryId = 3 },
                new SubCategory { Id = 11, SubCategoryName = "Washing Machine Service", CategoryId = 3 },
                new SubCategory { Id = 12, SubCategoryName = "Microwave Repair", CategoryId = 5 },
                new SubCategory { Id = 13, SubCategoryName = "Waterproofing & Texture Painting", CategoryId = 4 },
                new SubCategory { Id = 14, SubCategoryName = "Water Purifier Service", CategoryId = 5 },
                new SubCategory { Id = 15, SubCategoryName = "Geyser Service", CategoryId = 5 },
                new SubCategory { Id = 16, SubCategoryName = "TV Repair", CategoryId = 5 }
            );

            modelBuilder.Entity<Service>().HasData(
                new Service 
                { 
                    Id = 1, 
                    Name = "3 BHK Deep Cleaning", 
                    Description = "Comprehensive deep cleaning of 3 bedrooms, hall, kitchen, and bathrooms including dusting, vacuuming, and floor scrubbing.", 
                    Price = 2999.00m, 
                    Duration = "4 hours", 
                    SubCategoryId = 1, 
                    ImageUrl = "/assets/service-3bhk.png" 
                },
                new Service 
                { 
                    Id = 2, 
                    Name = "5 Seater Sofa Cleaning", 
                    Description = "Sofa dry cleaning, shampooing, and wet vacuuming to remove stains and dust mites.", 
                    Price = 799.00m, 
                    Duration = "2 hours", 
                    SubCategoryId = 2, 
                    ImageUrl = "/assets/service-sofa.png" 
                },
                new Service 
                { 
                    Id = 3, 
                    Name = "AC Filter Cleaning & Gas Charging", 
                    Description = "Cleaning of AC filters, testing of cooling gas, and recharging if required.", 
                    Price = 1499.00m, 
                    Duration = "1.5 hours", 
                    SubCategoryId = 3, 
                    ImageUrl = "/assets/service-ac.png" 
                },
                new Service 
                { 
                    Id = 4, 
                    Name = "Standard Kitchen Cleaning", 
                    Description = "Deep cleaning of kitchen countertops, sink, exhaust fan, cabinets exterior, and floor scrubbing.", 
                    Price = 1299.00m, 
                    Duration = "2.5 hours", 
                    SubCategoryId = 4, 
                    ImageUrl = "/assets/service-kitchen.png" 
                },
                new Service 
                { 
                    Id = 5, 
                    Name = "Wall Chimney Cleaning", 
                    Description = "Complete dismantling, degreasing, cleaning of chimney filters and outer body.", 
                    Price = 899.00m, 
                    Duration = "1.5 hours", 
                    SubCategoryId = 5, 
                    ImageUrl = "/assets/service-chimney.png" 
                },
                new Service 
                { 
                    Id = 6, 
                    Name = "1 BHK Interior Painting", 
                    Description = "Full interior wall painting of 1 BHK apartment, includes wall preparation, putty, and double coat painting.", 
                    Price = 4999.00m, 
                    Duration = "2 days", 
                    SubCategoryId = 6, 
                    ImageUrl = "/assets/service-painting.png" 
                },
                new Service 
                { 
                    Id = 7, 
                    Name = "Exterior House Paint Touch-up", 
                    Description = "Professional touch-up for exterior house walls, covers weather-proof protective paint coat.", 
                    Price = 7999.00m, 
                    Duration = "3 days", 
                    SubCategoryId = 7, 
                    ImageUrl = "/assets/service-ext-painting.png" 
                },
                new Service 
                { 
                    Id = 8, 
                    Name = "Bathroom Deep Cleaning (Single)", 
                    Description = "Deep scrubbing of wall tiles, sink, tap, toilet bowl, and floor disinfection.", 
                    Price = 399.00m, 
                    Duration = "1 hour", 
                    SubCategoryId = 8, 
                    ImageUrl = "/assets/service-bathroom.png" 
                },
                new Service 
                { 
                    Id = 9, 
                    Name = "Bathroom Deep Cleaning (Pack of 2)", 
                    Description = "Professional deep cleaning of two bathrooms for a sparkling clean look.", 
                    Price = 699.00m, 
                    Duration = "2 hours", 
                    SubCategoryId = 8, 
                    ImageUrl = "/assets/service-bathroom-pack.png" 
                },
                new Service 
                { 
                    Id = 10, 
                    Name = "Premium Carpet Shampooing", 
                    Description = "Vacuuming, organic shampoo washing, and wet extraction of dirt from standard carpets.", 
                    Price = 499.00m, 
                    Duration = "1.5 hours", 
                    SubCategoryId = 9, 
                    ImageUrl = "/assets/service-carpet.png" 
                },
                new Service 
                { 
                    Id = 11, 
                    Name = "Kitchen Countertop Sanitization", 
                    Description = "Intense cleaning of stovetops, tiles backsplash, and sanitization of countertops.", 
                    Price = 599.00m, 
                    Duration = "1 hour", 
                    SubCategoryId = 4, 
                    ImageUrl = "/assets/service-kitchen-counter.png" 
                },
                new Service 
                { 
                    Id = 12, 
                    Name = "Single Door Fridge Repair", 
                    Description = "Diagnostic check, thermostat replacement, gas charging check for single door models.", 
                    Price = 450.00m, 
                    Duration = "1 hour", 
                    SubCategoryId = 10, 
                    ImageUrl = "/assets/service-fridge.png" 
                },
                new Service 
                { 
                    Id = 13, 
                    Name = "Double Door Fridge Repair", 
                    Description = "Detailed diagnostics, cooling coil check, compressor repair or capacitor check.", 
                    Price = 750.00m, 
                    Duration = "1.5 hours", 
                    SubCategoryId = 10, 
                    ImageUrl = "/assets/service-fridge-double.png" 
                },
                new Service 
                { 
                    Id = 14, 
                    Name = "Top Load Washing Machine Repair", 
                    Description = "Fixing drain errors, drum spin issues, and inlet valve replacements.", 
                    Price = 550.00m, 
                    Duration = "1 hour", 
                    SubCategoryId = 11, 
                    ImageUrl = "/assets/service-washing.png" 
                },
                new Service 
                { 
                    Id = 15, 
                    Name = "Front Load Washing Machine Repair", 
                    Description = "Comprehensive diagnostic check, seal replacement, and electronic board troubleshooting.", 
                    Price = 850.00m, 
                    Duration = "1.5 hours", 
                    SubCategoryId = 11, 
                    ImageUrl = "/assets/service-washing-front.png" 
                },
                new Service 
                { 
                    Id = 16, 
                    Name = "Microwave Diagnostic & Repair", 
                    Description = "Fixing heating issues, turntable motor issues, magnetron repair, and safety checks.", 
                    Price = 399.00m, 
                    Duration = "1 hour", 
                    SubCategoryId = 12, 
                    ImageUrl = "/assets/service-microwave.png" 
                },
                new Service 
                { 
                    Id = 17, 
                    Name = "Living Room Accent Texture Wall", 
                    Description = "Creating premium metallic or rustic textures on a single accent wall, includes design options.", 
                    Price = 3499.00m, 
                    Duration = "1 day", 
                    SubCategoryId = 13, 
                    ImageUrl = "/assets/service-texture.png" 
                },
                new Service 
                { 
                    Id = 18, 
                    Name = "Bathroom Ceiling Waterproofing", 
                    Description = "Applying weather-proof primer and waterproof coatings to prevent leakage and mold.", 
                    Price = 1999.00m, 
                    Duration = "4 hours", 
                    SubCategoryId = 13, 
                    ImageUrl = "/assets/service-waterproofing.png" 
                },
                new Service
                {
                    Id = 19,
                    Name = "RO Filter Replacement & Service",
                    Description = "Complete filter membrane replacement, TDS adjustment, and water purifier sanitization.",
                    Price = 1499.00m,
                    Duration = "1 hour",
                    SubCategoryId = 14,
                    ImageUrl = "/assets/service-water-purifier.png"
                },
                new Service
                {
                    Id = 20,
                    Name = "RO Water Purifier Repair",
                    Description = "Diagnostics for water leakage, booster pump issues, auto-off malfunction, or electrical repair.",
                    Price = 399.00m,
                    Duration = "1 hour",
                    SubCategoryId = 14,
                    ImageUrl = "/assets/service-ro-repair.png"
                },
                new Service
                {
                    Id = 21,
                    Name = "Geyser Installation / Uninstallation",
                    Description = "Safe wall mounting, connecting inlet/outlet pipes, and performance testing.",
                    Price = 499.00m,
                    Duration = "1 hour",
                    SubCategoryId = 15,
                    ImageUrl = "/assets/service-geyser-install.png"
                },
                new Service
                {
                    Id = 22,
                    Name = "Geyser Heating Element Replacement",
                    Description = "Fixing no heating issues by replacing the thermostat or heating element safely.",
                    Price = 799.00m,
                    Duration = "1 hour",
                    SubCategoryId = 15,
                    ImageUrl = "/assets/service-geyser-heating.png"
                },
                new Service
                {
                    Id = 23,
                    Name = "LED/Smart TV Repair & Diagnostics",
                    Description = "Troubleshooting display problems, backlight repair, sound/audio check, and motherboard replacement.",
                    Price = 999.00m,
                    Duration = "1.5 hours",
                    SubCategoryId = 16,
                    ImageUrl = "/assets/service-tv-repair.png"
                }
            );

            modelBuilder.Entity<Offer>().HasData(
                new Offer { Id = 1, Code = "WELCOME50", DiscountPercentage = 50.00m, MaxDiscountAmount = 500.00m, MinOrderAmount = 300.00m, ExpiryDate = DateTime.UtcNow.AddMonths(12), IsActive = true },
                new Offer { Id = 2, Code = "CLEAN20", DiscountPercentage = 20.00m, MaxDiscountAmount = 1000.00m, MinOrderAmount = 1000.00m, ExpiryDate = DateTime.UtcNow.AddMonths(6), IsActive = true }
            );
        }
    }
}
