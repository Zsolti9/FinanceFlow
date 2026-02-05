using FinanceFlow.Api.Data;
using FinanceFlow.Api.DTOs;
using FinanceFlow.Api.Models;
using FinanceFlow.API.Dtos;
using FinanceFlow.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IJwtService _jwtService;

        public AuthController(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            IJwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        // =========================
        // REGISTER
        // =========================
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing != null)
                return BadRequest(new { error = "E-mail already registered" });

            var user = new AppUser
            {
                UserName = dto.DisplayName ?? dto.Email.Split('@')[0],
                Email = dto.Email,
                DisplayName = dto.DisplayName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    DisplayName = user.DisplayName ?? user.UserName
                }
            });
        }

        // =========================
        // LOGIN
        // =========================
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { error = "Invalid credentials" });

            var result = await _signInManager.CheckPasswordSignInAsync(
                user,
                dto.Password,
                lockoutOnFailure: false
            );

            if (!result.Succeeded)
                return Unauthorized(new { error = "Invalid credentials" });

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    DisplayName = user.DisplayName ?? user.UserName
                }
            });
        }

        // ------------------ GET USER ----------------------
        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                user.Id,
                user.Email,
                user.UserName,
                DisplayName = user.DisplayName ?? user.UserName
            });
        }

        // ------------------ UPDATE USER (NO PASSWORD HERE!) ----------------------
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.DisplayName = dto.DisplayName ?? user.DisplayName;
            user.Email = dto.Email ?? user.Email;

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                user.UserName = dto.Email;
                user.NormalizedEmail = dto.Email.ToUpperInvariant();
                user.NormalizedUserName = dto.Email.ToUpperInvariant();
            }

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return BadRequest(updateResult.Errors);

            return Ok(new { message = "User updated successfully" });
        }

        // ------------------ DELETE USER ----------------------
        [Authorize]
        [HttpDelete("delete-me")]
        public async Task<IActionResult> DeleteMe(
            [FromBody] DeleteAccountDto dto,
            [FromServices] ApplicationDbContext db)
        {
            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Password is required." });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Invalid token." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var ok = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!ok)
                return Unauthorized(new { message = "Wrong password." });

            await using var tx = await db.Database.BeginTransactionAsync();
            try
            {
                await db.Expenses
                    .Where(x => x.UserId == userId)
                    .ExecuteDeleteAsync();

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                await tx.CommitAsync();
                return Ok(new { message = "Account deleted." });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new
                {
                    message = "Server error.",
                    details = ex.Message
                });
            }
        }

        // ------------------ ME ----------------------
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.UserName,
                DisplayName = user.DisplayName ?? user.UserName
            });
        }
    }
}
