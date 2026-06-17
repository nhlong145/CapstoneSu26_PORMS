using System.ComponentModel.DataAnnotations;

namespace PORMS.Application.DTOs.Simulation;

public sealed class TriggerSimulationScenarioRequest
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string ScenarioName { get; init; } = "Emergency storm drill";

    [Required]
    [MinLength(5, ErrorMessage = "At least five weather snapshots are required.")]
    public IReadOnlyList<SimulationWeatherSnapshotDto> WeatherSnapshots { get; init; } = [];

    [Range(1, 100)]
    public short SpeedMultiplier { get; init; } = 100;
}
