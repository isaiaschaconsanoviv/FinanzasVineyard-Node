using System.ComponentModel.DataAnnotations;

namespace FinanzasVineyard.Models
{
    public class OtroRubro
    {
        [Required]
        public int Id { get; set; }
        [Required]
        [Display (Name = "No. Registro")]
        public int IdRegistro { get; set; }
        [Required]
        [Display(Name = "Concepto")]
        public string Tipo { get; set; } = string.Empty;
        [Required]
        public double Importe { get; set; }
        [Required]
        public string Moneda { get; set; } = string.Empty;
    }
}
