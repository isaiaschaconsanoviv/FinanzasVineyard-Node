using System.ComponentModel.DataAnnotations;

namespace FinanzasVineyard.Models
{
    public class Gasto
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public DateTime Fecha { get; set; }
        [Required, Display(Name = "A cuenta de")]
        public string Cuenta { get; set; }
        [Required]
        public string Concepto { get; set; }

        [Required]
        public double Importe { get; set; }
    }
}
