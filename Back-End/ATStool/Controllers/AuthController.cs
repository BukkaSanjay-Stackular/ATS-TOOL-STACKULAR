// Controllers/AuthController.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ATStool.Models;
using ATStool.DTOs;
using ATStool.Services;
using Microsoft.AspNetCore.Authorization;

namespace ATStool.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;

        public AuthController(UserManager<User> userManager, TokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var validTypes = new[] { "Interviewer", "Recruiter", "Admin" };
            if (!validTypes.Contains(dto.UserType))
                return BadRequest("UserType must be Interviewer, Recruiter, or Admin.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.UserName,
                UserType = dto.UserType
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, dto.UserType);

            return Ok(ApiResponse<object>.Ok("User successfully Created", user));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<string>.Fail("Validation failed.", errors));
            }

            var user = await _userManager.FindByNameAsync(dto.UserName);
            if (user == null)
                return Unauthorized(ApiResponse<string>.Fail("Invalid username or password"));

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!isPasswordValid)
                return Unauthorized(ApiResponse<string>.Fail("Invalid username or password."));

            var roles = await _userManager.GetRolesAsync(user);
            var userType = roles.FirstOrDefault() ?? "Interviewer";

            // ← Generate JWT and set it as cookie in one line
            _tokenService.GenerateAndSetToken(user, userType);

            var data = new { userType, name = user.FullName, email = user.Email };
            // ← Removed token from response, it's now in the cookie

            return Ok(ApiResponse<object>.Ok("Login successful.", data));
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            _tokenService.ClearTokenCookie(); // ← clears the cookie

            return Ok(ApiResponse<string>.Ok("Logged out successfully.", null));
        }
    }
}