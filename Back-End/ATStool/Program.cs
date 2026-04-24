using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ATStool.Models;
using ATStool.Data;
using ATStool.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(opts =>
    {
        opts.SuppressModelStateInvalidFilter = true;
    });

builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<User>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };

        // ← Read JWT from cookie instead of Authorization header
        opts.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["ATSAuth"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddHttpContextAccessor(); // ← required for CookieService
builder.Services.AddScoped<TokenService>();
builder.Services.AddHttpClient<ExternalApiService>();

// ── CORS ──────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // ← required for cookies
    });
});
// ─────────────────────────────────────────────────────────────────────

var app = builder.Build();

await SeedData(app);

app.UseCors("AllowFrontend");   // ← 1st
app.UseAuthentication();         // ← 2nd
app.UseAuthorization();          // ← 3rd
app.MapControllers();            // ← 4th
app.Run();


// ── Seed Roles & Default Admin ────────────────────────────────────────
// ── Seed Roles & Default Admin ────────────────────────────────────────

static async Task SeedData(WebApplication app)

{

    using var scope = app.Services.CreateScope();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    foreach (var role in new[] { "Admin", "Recruiter", "Interviewer" })

        if (!await roleManager.RoleExistsAsync(role))

            await roleManager.CreateAsync(new IdentityRole(role));

    // ✅ Roles are seeded automatically on startup
    // ✅ Users are created via Register API only
}
