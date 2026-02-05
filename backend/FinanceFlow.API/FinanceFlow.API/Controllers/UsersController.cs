using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using FinanceFlow.Api.Models;
using FinanceFlow.API.Dtos;

[Authorize]
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IWebHostEnvironment _env;

    public UsersController(
        UserManager<AppUser> userManager,
        IWebHostEnvironment env)
    {
        _userManager = userManager;
        _env = env;
    }

    // =========================
    // GET /api/users/me
    // =========================
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            profileImage = user.ProfileImagePath
        });
    }

    // =========================
    // POST /api/users/profile-image
    // =========================
    [HttpPost("profile-image")]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nincs fájl.");

        if (file.ContentType != "image/png")
            return BadRequest("Csak PNG engedélyezett.");

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var folder = Path.Combine(_env.WebRootPath, "avatars");
        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);

        // IdentityUser.Id = string
        var filePath = Path.Combine(folder, $"{user.Id}.png");

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.ProfileImagePath = $"/avatars/{user.Id}.png";
        await _userManager.UpdateAsync(user);

        return Ok(new { imageUrl = user.ProfileImagePath });
    }

    [HttpPut("username")]
    public async Task<IActionResult> UpdateUsername([FromBody] UpdateUsernameDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username))
            return BadRequest("Felhasználónév nem lehet üres.");

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        user.UserName = dto.Username;
        user.NormalizedUserName = dto.Username.ToUpperInvariant();

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(string.Join(", ",
                result.Errors.Select(e => e.Description)));
        }

        return Ok(new { username = user.UserName });
    }


    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        // 🔍 KÉZI ELLENŐRZÉS (debug + stabil)
        var ok = await _userManager.CheckPasswordAsync(user, dto.CurrentPassword);
        if (!ok)
            return BadRequest("Hibás jelenlegi jelszó.");

        var result = await _userManager.ChangePasswordAsync(
            user,
            dto.CurrentPassword,
            dto.NewPassword
        );

        if (!result.Succeeded)
            return BadRequest(string.Join(", ",
                result.Errors.Select(e => e.Description)));

        return Ok();
    }


    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences(UpdatePreferencesDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        user.Language = dto.Language;
        user.DefaultCurrency = dto.DefaultCurrency;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(string.Join(", ",
                result.Errors.Select(e => e.Description)));
        }

        return Ok(new
        {
            user.Language,
            user.DefaultCurrency
        });
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        return Ok(new
        {
            language = user.Language,
            defaultCurrency = user.DefaultCurrency,
            notificationsEnabled = user.NotificationsEnabled
        });
    }

}
