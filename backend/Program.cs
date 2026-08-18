using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HomeCare_BE.Data;
using HomeCare_BE.Hubs;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on port 5100
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5100);
});

// Add DbContext with SQLite
builder.Services.AddDbContext<HomeCareDbContext>(options =>
    options.UseSqlite("Data Source=homecare.db")
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add SignalR
builder.Services.AddSignalR();

// Enable CORS for frontend applications (Customer runs on 4300, Admin on 4200)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Allow any origin for ease of local development
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR Hub connections
    });
});

// Configure JWT Authentication
var key = Encoding.ASCII.GetBytes("SecretKeySuperLongNameForTestingJWTBearer12345");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

// Auto-create and seed database at startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HomeCareDbContext>();
    dbContext.Database.EnsureCreated();
}

app.UseCors("AllowAll");

app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLowerInvariant();
    if (path != null && (path.StartsWith("/assets/") || path.StartsWith("/uploads/")))
    {
        var filePath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", path.TrimStart('/'));
        if (!System.IO.File.Exists(filePath))
        {
            if (path.EndsWith(".pdf"))
            {
                context.Response.ContentType = "application/pdf";
                byte[] pdfBytes = System.Text.Encoding.UTF8.GetBytes("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 40 >>\nstream\nBT /F1 24 Tf 100 700 Td (Resume Document) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000062 00000 n\n0000000121 00000 n\n0000000229 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n318\n%%EOF");
                await context.Response.Body.WriteAsync(pdfBytes, 0, pdfBytes.Length);
                return;
            }

            if (path.Contains("expert1") || path.Contains("avatar"))
            {
                context.Response.ContentType = "image/svg+xml";
                var expertSvg = @"<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
                    <rect width='120' height='120' rx='60' fill='#FFB752'/>
                    <circle cx='60' cy='45' r='20' fill='white'/>
                    <path d='M30,90 C30,70 40,65 60,65 C80,65 90,70 90,90' fill='white'/>
                </svg>";
                await context.Response.WriteAsync(expertSvg);
                return;
            }

            context.Response.ContentType = "image/svg+xml";
            string svg;
            if (path.Contains("cleaning") || path.Contains("clean") || path.Contains("sofa") || path.Contains("3bhk"))
            {
                svg = @"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'>
                    <rect width='100%' height='100%' fill='#EBF3FF' rx='16'/>
                    <path d='M40 30 L45 35 L40 40 L35 35 Z' fill='#4540E1'/>
                    <path d='M160 110 L163 113 L160 116 L157 113 Z' fill='#4540E1'/>
                    <circle cx='100' cy='75' r='35' fill='#4540E1' opacity='0.15'/>
                    <path d='M90 60 H110 V100 H90 Z M85 68 H115' stroke='#4540E1' stroke-width='4' stroke-linecap='round' fill='none'/>
                    <path d='M95 60 C95 50 105 50 105 60' stroke='#4540E1' stroke-width='4' stroke-linecap='round' fill='none'/>
                    <circle cx='70' cy='85' r='10' stroke='#4540E1' stroke-width='3' fill='none'/>
                    <circle cx='130' cy='65' r='8' stroke='#4540E1' stroke-width='3' fill='none'/>
                </svg>";
            }
            else if (path.Contains("repair") || path.Contains("appliance") || path.Contains("ac"))
            {
                svg = @"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'>
                    <rect width='100%' height='100%' fill='#FFF4E5' rx='16'/>
                    <circle cx='100' cy='75' r='35' fill='#FFB752' opacity='0.15'/>
                    <circle cx='100' cy='75' r='15' stroke='#FFB752' stroke-width='6' fill='none'/>
                    <path d='M80 95 L120 55 M115 50 L125 60' stroke='#FFB752' stroke-width='6' stroke-linecap='round'/>
                </svg>";
            }
            else if (path.Contains("painting") || path.Contains("paint"))
            {
                svg = @"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'>
                    <rect width='100%' height='100%' fill='#F3EFFF' rx='16'/>
                    <circle cx='100' cy='75' r='35' fill='#9b51e0' opacity='0.15'/>
                    <path d='M85 60 H115 V80 H85 Z' fill='#9b51e0'/>
                    <path d='M100 80 V105' stroke='#9b51e0' stroke-width='5' stroke-linecap='round'/>
                    <circle cx='95' cy='90' r='5' fill='#9b51e0'/>
                </svg>";
            }
            else
            {
                svg = @"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'>
                    <rect width='100%' height='100%' fill='#F0F0F0' rx='16'/>
                    <rect x='10' y='10' width='180' height='130' rx='12' fill='none' stroke='#CCCCCC' stroke-width='2' stroke-dasharray='5 5'/>
                    <circle cx='100' cy='75' r='30' fill='#CCCCCC' opacity='0.3'/>
                    <text x='100' y='83' font-family='Arial,sans-serif' font-size='26' font-weight='bold' fill='#888888' text-anchor='middle'>S</text>
                </svg>";
            }
            await context.Response.WriteAsync(svg);
            return;
        }
    }
    await next();
});

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map the Booking SignalR Hub
app.MapHub<BookingHub>("/hubs/booking");

app.Run();
