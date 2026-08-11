using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace FinanzasVineyard.Models
{
    public class RegistroCorte
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public Corte Corte { get; set; }

        [Required, Display(Name = "Concepto")]
        public string Concepto { get; set; }

        [Required, Display(Name = "Importe (MXN)")]
        public double Importe { get; set; }
        
        [Required, Display(Name = "Diferencia (MXN)")]
        public double Diferencia { get; set; }

    }
}
