using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceFlow.API.Models
{
    public class UserData
    {
        [Key] 
        public int Id { get; set; }
        [ForeignKey("AppUser")]
        [Column(TypeName ="varchar(255)")]
        public string UserId { get; set; }
        public int Fizetes { get; set; }
        public bool Auto { get; set; }
        public int BenzinKolt { get; set; }
        public bool Lakas { get; set; }
        public int LakasKolt { get; set; }
        public int Szamlak { get; set; }
        public int Egyeb { get; set; }

        
    }
}
