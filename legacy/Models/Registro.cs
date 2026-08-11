using System.ComponentModel.DataAnnotations;

namespace FinanzasVineyard.Models
{
    public class Registro
    {
        public int Id { get; set; }
        [Required]
        public int IdEntrada { get; set; }
        [Required]
        public string Nombre { get; set; } = string.Empty;
        [Required]
        public double Diezmo { get; set; }
        [Required]
        [Display(Name = "Moneda")]
        public string MonedaDiezmo { get; set; } = string.Empty;
        [Required]
        public double Ofrenda { get; set; }
        [Required]
        [Display(Name = "Moneda")]
        public string MonedaOfrenda { get; set; } = string.Empty;
        [Required]
        [Display(Name = "Otros")]
        public IList<OtroRubro> Otros { get; set; } = new List<OtroRubro>();

    }
}
