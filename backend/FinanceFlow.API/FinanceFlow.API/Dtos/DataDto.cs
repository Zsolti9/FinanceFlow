namespace FinanceFlow.API.Dtos
{
    public class DataDto
    {

        public string UserId { get; set; }
        public int Fizetes { get; set; } 
        public bool Auto { get; set; } = false;
        public int Benzinkolt { get; set; }
        public bool Lakhatas { get; set; } = false;
        public int Lakaskolt { get; set; } 
        public int Szamlak { get; set; } 
        public int Egyeb { get; set; } 
    }
}
