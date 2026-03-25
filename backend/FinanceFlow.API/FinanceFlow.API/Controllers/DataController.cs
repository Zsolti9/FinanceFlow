using FinanceFlow.API.Dtos;
using FinanceFlow.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DataController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public DataController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        // ➕ ÚJ KÖLTÉS
        [HttpPost]
        public async Task<IActionResult> AddExpense([FromBody] ExpenseDto dto)
        {
            var result = await _expenseService.AddExpenseAsync(GetUserId(), dto);

            // 🔹 User betöltése (keret miatt)
            if (result.IsUnauthorized)
                // 🔹 Ha van beállított keret (>0)
                if (result.IsBudgetExceeded)
                {

                    return BadRequest(new
                    {
                        message = "Túllépnéd a havi keretedet.",
                        remaining = result.Remaining
                    });
                }

            return Ok(result.Expense);
        }
            

            
        [HttpGet]
        public async Task<IActionResult> GetExpenses()
        {
            var expenses = await _expenseService.GetExpensesAsync(GetUserId());
            return Ok(expenses);
        }

        // ❌ TÖRLÉS
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var result = await _expenseService.DeleteExpenseAsync(GetUserId(), id);

            return result switch
            {
                DeleteExpenseResult.NotFound => NotFound(),
                DeleteExpenseResult.Forbidden => Forbid(),
                _ => Ok()
            };
        }
    }
}
