using FinanceFlow.Api.Services;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace FinanceFlow.API.Tests;

public class JwtServiceTests
{
    [Fact]
    public void GenerateToken_WithRolesAndDisplayName_CreatesExpectedClaims()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "01234567890123456789012345678901",
                ["Jwt:Issuer"] = "FinanceFlowIssuer",
                ["Jwt:Audience"] = "FinanceFlowAudience",
                ["Jwt:ExpiresMinutes"] = "60"
            })
            .Build();

        var sut = new JwtService(configuration);
        var user = new AppUser
        {
            Id = "user-123",
            Email = "user@financeflow.dev",
            DisplayName = "Test User"
        };

        var token = sut.GenerateToken(user, ["Admin", "User"]);
        var parsed = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal("FinanceFlowIssuer", parsed.Issuer);
        Assert.Equal("user-123", parsed.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("user@financeflow.dev", parsed.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal("Test User", parsed.Claims.First(c => c.Type == "displayName").Value);

        var roles = parsed.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
        Assert.Contains("Admin", roles);
        Assert.Contains("User", roles);
    }

    [Fact]
    public void GenerateToken_WithNullOptionalFields_FallsBackToEmptyStrings()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "01234567890123456789012345678901",
                ["Jwt:Issuer"] = "FinanceFlowIssuer",
                ["Jwt:Audience"] = "FinanceFlowAudience",
                ["Jwt:ExpiresMinutes"] = "60"
            })
            .Build();

        var sut = new JwtService(configuration);
        var user = new AppUser
        {
            Id = "user-456",
            Email = null,
            DisplayName = null
        };

        var token = sut.GenerateToken(user);
        var parsed = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal(string.Empty, parsed.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal(string.Empty, parsed.Claims.First(c => c.Type == "displayName").Value);
        Assert.DoesNotContain(parsed.Claims, c => c.Type == ClaimTypes.Role);
    }
}