namespace FinanceFlow.API.Dtos
{
    public class DataDto
    {
        public int fizetes { get; set; } 
        public bool auto { get; set; } = false;
        public int benzinkolt { get; set; }
        public bool lakhatas { get; set; }=false;
        public int lakaskolt { get; set; } 
        public int szamlak { get; set; } 
        public int egyeb { get; set; } 
    }
}
