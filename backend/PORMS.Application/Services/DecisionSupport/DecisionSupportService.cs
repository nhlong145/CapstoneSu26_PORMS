using Microsoft.EntityFrameworkCore;
using PORMS.Application.Common.Interfaces;
using PORMS.Application.DTOs.Mode;
using PORMS.Application.DTOs.Ports;
using PORMS.Application.DTOs.Risk;
using PORMS.Application.DTOs.Sop;
using PORMS.Application.DTOs.Weather;
using PORMS.Domain.Entities;
using PORMS.Domain.Enums;

namespace PORMS.Application.Services.DecisionSupport;

public sealed class DecisionSupportService : IDecisionSupportService
{
    private static readonly TimeSpan WeatherStaleAfter = TimeSpan.FromMinutes(30);
    private readonly IApplicationDbContext _dbContext;

    public DecisionSupportService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PortDecisionSupportDto?> GetDecisionSupportAsync(
        Guid portId,
        CancellationToken cancellationToken = default)
    {
        var state = await LoadStateAsync(portId, includeSimulation: false, cancellationToken);
        if (state is null)
        {
            return null;
        }

        return ToDecisionSupportDto(state);
    }

    public async Task<PortLiveStatusDto?> GetLiveStatusAsync(
        Guid portId,
        bool includeSimulation = false,
        CancellationToken cancellationToken = default)
    {
        var state = await LoadStateAsync(portId, includeSimulation, cancellationToken);
        if (state is null)
        {
            return null;
        }

        return new PortLiveStatusDto(
            state.Port.Id,
            state.Port.Code,
            state.Port.Name,
            state.LatestWeather is null ? null : ToWeatherDto(state.LatestWeather),
            state.LatestRisk is null ? null : ToRiskDto(state.LatestRisk),
            state.LatestModeLog is null ? null : ToModeLogDto(state.LatestModeLog),
            state.EffectiveMode,
            state.CurrentRisk,
            state.Decision.Code,
            state.Decision.Text,
            state.Decision.CanHandleContainers,
            state.Decision.CanAcceptVesselEntry,
            state.Decision.Reasons,
            state.Recommendations,
            state.UnreadAlertCount,
            state.IsStale,
            DateTimeOffset.UtcNow);
    }

    private async Task<DecisionState?> LoadStateAsync(
        Guid portId,
        bool includeSimulation,
        CancellationToken cancellationToken)
    {
        var port = await _dbContext.Ports
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == portId && x.IsActive, cancellationToken);
        if (port is null)
        {
            return null;
        }

        var weatherQuery = _dbContext.WeatherReadings
            .AsNoTracking()
            .Where(x => x.PortId == portId);
        if (!includeSimulation)
        {
            weatherQuery = weatherQuery.Where(x => !x.IsSimulation);
        }

        var latestWeather = await weatherQuery
            .OrderByDescending(x => includeSimulation ? x.RecordedAt : x.ObservedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var riskQuery = _dbContext.RiskAssessments
            .AsNoTracking()
            .Where(x => x.PortId == portId);
        if (!includeSimulation)
        {
            riskQuery = riskQuery.Where(x => !x.IsSimulation);
        }

        var latestRisk = await riskQuery
            .OrderByDescending(x => x.EvaluatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var modeQuery = _dbContext.OperationModeLogs
            .AsNoTracking()
            .Where(x => x.PortId == portId);
        if (!includeSimulation)
        {
            modeQuery = modeQuery.Where(x => !x.IsSimulation);
        }

        var latestModeLog = await modeQuery
            .OrderByDescending(x => x.ChangedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var currentRisk = latestRisk?.FinalRiskLevel ?? port.CurrentRiskLevel;
        var effectiveMode = latestModeLog?.NewMode ?? port.CurrentMode;
        var isStale = latestWeather is null ||
            DateTimeOffset.UtcNow - latestWeather.ObservedAt > WeatherStaleAfter;
        var recommendations = await BuildRecommendationsAsync(
            portId,
            currentRisk,
            cancellationToken);
        var decision = BuildDecision(
            effectiveMode,
            currentRisk,
            isStale,
            latestWeather,
            latestRisk,
            recommendations);
        var alertsQuery = _dbContext.Alerts
            .AsNoTracking()
            .Where(x => x.PortId == portId && x.ReadAt == null);
        if (!includeSimulation)
        {
            alertsQuery = alertsQuery.Where(x => !x.IsSimulation);
        }

        var unreadAlertCount = await alertsQuery.CountAsync(cancellationToken);

        return new DecisionState(
            port,
            latestWeather,
            latestRisk,
            latestModeLog,
            effectiveMode,
            currentRisk,
            isStale,
            recommendations,
            decision,
            unreadAlertCount);
    }

    private async Task<IReadOnlyList<SopRecommendationDto>> BuildRecommendationsAsync(
        Guid portId,
        RiskLevel riskLevel,
        CancellationToken cancellationToken)
    {
        var zones = await _dbContext.Zones
            .AsNoTracking()
            .Where(x => x.PortId == portId && x.IsActive)
            .ToListAsync(cancellationToken);
        var rules = await _dbContext.SopRules
            .AsNoTracking()
            .Where(x => x.IsActive && x.TriggerRiskLevel == riskLevel)
            .OrderBy(x => x.ExecutionOrder)
            .ThenBy(x => x.RuleName)
            .ToListAsync(cancellationToken);

        var recommendations = new List<SopRecommendationDto>();
        foreach (var rule in rules)
        {
            var targets = rule.AppliesToZoneType is null
                ? [null]
                : zones
                    .Where(x => x.ZoneType == rule.AppliesToZoneType)
                    .Cast<global::PORMS.Domain.Entities.Zone?>()
                    .ToList();

            foreach (var zone in targets)
            {
                recommendations.Add(new SopRecommendationDto(
                    rule.Id,
                    rule.RuleName,
                    zone?.Id,
                    zone?.Name,
                    zone?.ZoneType,
                    rule.TriggerRiskLevel,
                    rule.ActionType,
                    rule.ActionDescription,
                    rule.TargetOperationMode,
                    rule.ExecutionOrder,
                    rule.AlertSeverity,
                    rule.AlertMessage));
            }
        }

        return recommendations;
    }

    private static Decision BuildDecision(
        OperationMode currentMode,
        RiskLevel currentRisk,
        bool isStale,
        WeatherReading? latestWeather,
        RiskAssessment? latestRisk,
        IReadOnlyCollection<SopRecommendationDto> recommendations)
    {
        var reasons = new List<string>();
        if (latestWeather is null)
        {
            reasons.Add("No weather reading is available for this port.");
        }
        else
        {
            reasons.Add($"Wind {latestWeather.WindSpeedMs:0.0} m/s, Beaufort {latestWeather.BeaufortNumber}.");
            reasons.Add($"Rainfall {latestWeather.Rainfall1hMm ?? 0:0.0} mm/h.");
            reasons.Add(latestWeather.VisibilityKm.HasValue
                ? $"Visibility {latestWeather.VisibilityKm.Value:0.0} km."
                : "Visibility data is not available.");
        }

        if (latestRisk is not null)
        {
            reasons.Add(
                $"Risk breakdown: wind={latestRisk.WindRiskLevel}, rain={latestRisk.RainRiskLevel}, visibility={latestRisk.VisibilityRiskLevel}.");
        }

        if (recommendations.Count > 0)
        {
            reasons.Add($"{recommendations.Count} active SOP recommendation(s) match the current risk level.");
        }

        if (currentMode == OperationMode.STOP)
        {
            reasons.Add("Current operation mode is STOP.");
        }
        else if (currentMode == OperationMode.LIMITED)
        {
            reasons.Add("Current operation mode is LIMITED.");
        }

        if (isStale)
        {
            reasons.Add("Weather data is stale or missing.");
            return new Decision(
                "VERIFY_WEATHER_DATA",
                "Verify latest weather conditions before deciding.",
                null,
                null,
                reasons);
        }

        if (currentMode == OperationMode.STOP || currentRisk == RiskLevel.CRITICAL)
        {
            return new Decision(
                "STOP_OPERATIONS",
                "Stop weather-sensitive operations until conditions are reviewed.",
                false,
                false,
                reasons);
        }

        if (currentRisk == RiskLevel.HIGH || currentMode == OperationMode.LIMITED)
        {
            return new Decision(
                "RESTRICT_OPERATIONS",
                "Restrict container handling and vessel entry and follow active SOP recommendations.",
                false,
                false,
                reasons);
        }

        if (currentRisk == RiskLevel.MEDIUM)
        {
            return new Decision(
                "OPERATE_WITH_CAUTION",
                "Operations may continue with caution under continuous monitoring.",
                true,
                true,
                reasons);
        }

        return new Decision(
            "OPERATE_NORMALLY",
            "Weather-sensitive operations may continue under normal monitoring.",
            true,
            true,
            reasons);
    }

    private static PortDecisionSupportDto ToDecisionSupportDto(DecisionState state)
        => new(
            state.Port.Id,
            state.Port.Code,
            state.Port.Name,
            state.EffectiveMode,
            state.CurrentRisk,
            state.Decision.Code,
            state.Decision.Text,
            state.Decision.CanHandleContainers,
            state.Decision.CanAcceptVesselEntry,
            state.Decision.Reasons,
            state.LatestWeather is null ? null : ToWeatherDto(state.LatestWeather),
            state.LatestRisk is null ? null : ToRiskDto(state.LatestRisk),
            state.IsStale,
            new MarineDataCoverageDto(
                false,
                false,
                false,
                "Current decision score evaluates wind, rain, and visibility. Wave, tide, and sea-current data are not available."),
            state.Recommendations);

    private static WeatherReadingDto ToWeatherDto(WeatherReading reading)
        => new(
            reading.Id,
            reading.PortId,
            reading.WindSpeedMs,
            reading.BeaufortNumber,
            reading.WindDirectionDeg,
            reading.WindGustMs,
            reading.Rainfall1hMm,
            reading.Rainfall3hMm,
            reading.VisibilityKm,
            reading.TemperatureC,
            reading.HumidityPct,
            reading.PressureHpa,
            reading.OpenWeatherCode,
            reading.OpenWeatherDescription,
            reading.OpenWeatherIcon,
            reading.ObservedAt,
            reading.RecordedAt,
            reading.DataSource,
            reading.IsSimulation);

    private static RiskAssessmentDto ToRiskDto(RiskAssessment assessment)
        => new(
            assessment.Id,
            assessment.PortId,
            assessment.WeatherReadingId,
            assessment.FinalRiskLevel,
            assessment.WindRiskLevel,
            assessment.RainRiskLevel,
            assessment.VisibilityRiskLevel,
            assessment.PreviousRiskLevel,
            assessment.LevelChanged,
            assessment.BeaufortNumber,
            assessment.Rainfall1hMm,
            assessment.VisibilityKm,
            assessment.AssessmentSummary,
            assessment.EvaluatedAt,
            assessment.IsSimulation);

    private static OperationModeLogDto ToModeLogDto(OperationModeLog log)
        => new(
            log.Id,
            log.PortId,
            log.PreviousMode,
            log.NewMode,
            log.TriggeredByRiskLevel,
            log.TriggeredBySopRuleId,
            log.OverriddenByUserId,
            log.OverrideReason,
            log.ChangeType,
            log.ChangedAt,
            log.IsSimulation);

    private sealed record DecisionState(
        Port Port,
        WeatherReading? LatestWeather,
        RiskAssessment? LatestRisk,
        OperationModeLog? LatestModeLog,
        OperationMode EffectiveMode,
        RiskLevel CurrentRisk,
        bool IsStale,
        IReadOnlyList<SopRecommendationDto> Recommendations,
        Decision Decision,
        int UnreadAlertCount);

    private sealed record Decision(
        string Code,
        string Text,
        bool? CanHandleContainers,
        bool? CanAcceptVesselEntry,
        IReadOnlyList<string> Reasons);
}
