using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ATStool.Models;
using ATStool.Constants;

namespace ATStool.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TokenService(IConfiguration config, IHttpContextAccessor httpContextAccessor)
        {
            _config = config;
            _httpContextAccessor = httpContextAccessor;
        }

        // Generate JWT and set it as a cookie
        public void GenerateAndSetToken(User user, string userType)
        {
            var token = GenerateToken(user, AppRoles.Normalize(userType));
            SetTokenCookie(token);
        }

        // Just generate the token
        private string GenerateToken(User user, string userType)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email,          user.Email!),
                new Claim(ClaimTypes.Name,           user.FullName!),
                new Claim(ClaimTypes.Role,           userType) // ← single role, no foreach needed
            };

            // ← removed foreach loop, it was leftover from IList<string> version

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Set JWT inside HttpOnly cookie
        private void SetTokenCookie(string token)
        {
            _httpContextAccessor.HttpContext?.Response.Cookies.Append("ATSAuth", token, new CookieOptions
            {
                HttpOnly = true,
                //Secure = true,
                Secure = false,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(8)
            });
        }

        // Clear cookie on logout
        public void ClearTokenCookie()
        {
            _httpContextAccessor.HttpContext?.Response.Cookies.Delete("ATSAuth");
        }
    }
}
