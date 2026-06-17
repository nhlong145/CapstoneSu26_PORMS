using System.ComponentModel.DataAnnotations;
using PORMS.Application.DTOs.Mode;
using PORMS.Application.DTOs.Simulation;
using PORMS.Application.DTOs.Weather;
using PORMS.Domain.Enums;
using Xunit;

namespace PORMS.Tests.Unit;

public sealed class RequestValidationTests
{
    [Fact]
    public void ManualWeatherInputRequest_AcceptsValidValues()
    {
        var request = new ManualWeatherInputRequest
        {
            PortId = Guid.NewGuid(),
            WindSpeedMs = 19m,
            Rainfall1hMm = 20m,
            VisibilityKm = 8m,
            TemperatureC = 30m,
            HumidityPct = 80,
            ObservedAt = DateTimeOffset.UtcNow,
            Notes = "Manual weather test"
        };

        Assert.Empty(Validate(request));
    }

    [Theory]
    [InlineData(-0.1, 20, 8)]
    [InlineData(101, 20, 8)]
    [InlineData(19, -0.1, 8)]
    [InlineData(19, 1001, 8)]
    [InlineData(19, 20, -0.1)]
    [InlineData(19, 20, 51)]
    public void ManualWeatherInputRequest_RejectsOutOfRangeWeather(
        double windSpeedMs,
        double rainfall1hMm,
        double visibilityKm)
    {
        var request = new ManualWeatherInputRequest
        {
            PortId = Guid.NewGuid(),
            WindSpeedMs = (decimal)windSpeedMs,
            Rainfall1hMm = (decimal)rainfall1hMm,
            VisibilityKm = (decimal)visibilityKm,
            TemperatureC = 30m,
            HumidityPct = 80,
            ObservedAt = DateTimeOffset.UtcNow
        };

        Assert.NotEmpty(Validate(request));
    }

    [Fact]
    public void OverrideModeRequest_RequiresTwentyCharacterReason()
    {
        var request = new OverrideModeRequest
        {
            TargetMode = OperationMode.LIMITED,
            OverrideReason = "Too short"
        };

        var errors = Validate(request);

        Assert.Contains(errors, error =>
            error.MemberNames.Contains(nameof(OverrideModeRequest.OverrideReason)));
    }

    [Fact]
    public void OverrideModeRequest_AcceptsValidReason()
    {
        var request = new OverrideModeRequest
        {
            TargetMode = OperationMode.STOP,
            OverrideReason = "Weather conditions require an immediate manual safety stop."
        };

        Assert.Empty(Validate(request));
    }

    [Fact]
    public void TriggerSimulationScenarioRequest_RequiresFiveSnapshots()
    {
        var request = new TriggerSimulationScenarioRequest
        {
            ScenarioName = "Storm drill",
            WeatherSnapshots =
            [
                new(5m, 0m, 10m, 30m, 70, DateTimeOffset.UtcNow)
            ],
            SpeedMultiplier = 100
        };

        var errors = Validate(request);

        Assert.Contains(errors, error =>
            error.MemberNames.Contains(nameof(TriggerSimulationScenarioRequest.WeatherSnapshots)));
    }

    [Fact]
    public void TriggerSimulationScenarioRequest_AcceptsDemoSequence()
    {
        var now = DateTimeOffset.UtcNow;
        var request = new TriggerSimulationScenarioRequest
        {
            ScenarioName = "Da Nang emergency storm drill",
            WeatherSnapshots =
            [
                new(4m, 0m, 12m, 30m, 70, now),
                new(11m, 12m, 8m, 29m, 76, now.AddMinutes(15)),
                new(18m, 30m, 4m, 28m, 82, now.AddMinutes(30)),
                new(26m, 55m, 0.8m, 27m, 90, now.AddMinutes(45)),
                new(8m, 4m, 15m, 29m, 74, now.AddMinutes(60))
            ],
            SpeedMultiplier = 100
        };

        Assert.Empty(Validate(request));
    }

    private static IReadOnlyList<ValidationResult> Validate(object request)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(
            request,
            new ValidationContext(request),
            results,
            validateAllProperties: true);
        return results;
    }
}
