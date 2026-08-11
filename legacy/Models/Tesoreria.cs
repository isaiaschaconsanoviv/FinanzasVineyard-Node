using System.ComponentModel.DataAnnotations;

namespace FinanzasVineyard.Models
{
    public class Tesoreria
    {
        public int Id { get; set; } 
        [Required]
        public int EntradaId { get; set; }
        [Required]
        public string Concepto { get; set; } = string.Empty;
        [Required, Display(Name = "En tesorería")]
        public double Cantidad {  get; set; }
    }
}
