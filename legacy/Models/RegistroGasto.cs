using System.ComponentModel.DataAnnotations;

namespace FinanzasVineyard.Models
{
    public class RegistroGasto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public Entrada Entrada { get; set; }

        [Required, Display(Name = "Concepto")]
        public string Concepto { get; set; }

        [Required, Display(Name = "Importe (MXN)")]
        public double Importe { get; set; }
    }
}
