using FinanceFlow.Api.Models;
using FinanceFlow.Api.Services;
using FinanceFlow.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace FinanceFlow.Api.Tests;

public class UserDataServiceTests
{
    [Fact]
    public async Task CreateUserDataAsync_PersistsEntityInDatabase()
    {
        await using var context = CreateContext();
        var sut = new UserDataService(context);
        var entity = new UserData
        {
            UserId = "user-1",
            Fizetes = 500000,
            Auto = true,
            BenzinKolt = 40000,
            Lakas = true,
            LakasKolt = 120000,
            Szamlak = 30000,
            Egyeb = 15000
        };

        await sut.CreateUserDataAsync(entity);

        var stored = await context.UserData.SingleAsync();
        Assert.Equal("user-1", stored.UserId);
        Assert.Equal(500000, stored.Fizetes);
        Assert.True(stored.Auto);
    }

    [Fact]
    public async Task GetAllUserDataAsync_ReturnsAllRows()
    {
        await using var context = CreateContext();
        context.UserData.AddRange(
            new UserData { UserId = "user-a", Fizetes = 100000, Szamlak = 10000 },
            new UserData { UserId = "user-b", Fizetes = 200000, Szamlak = 15000 });
        await context.SaveChangesAsync();

        var sut = new UserDataService(context);
        var result = await sut.GetAllUserDataAsync();

        Assert.Equal(2, result.Count);
        Assert.Contains(result, x => x.UserId == "user-a");
        Assert.Contains(result, x => x.UserId == "user-b");
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}