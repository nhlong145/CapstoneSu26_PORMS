using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PORMS.API.Extensions;
using PORMS.Application.Common;
using PORMS.Application.Common.Interfaces;
using PORMS.Application.DTOs.Tasks;
using PORMS.Domain.Enums;

namespace PORMS.API.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public sealed class TaskController : ControllerBase
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    private readonly IApplicationDbContext _dbContext;

    public TaskController(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public Task<IActionResult> GetTasksAsync(
        [FromQuery] Guid? portId,
        [FromQuery] Guid? zoneId,
        [FromQuery] string? status,
        [FromQuery] bool includeSimulation = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        CancellationToken cancellationToken = default)
        => GetTasksForScopeAsync(
            portId,
            zoneId,
            status,
            includeSimulation,
            page,
            pageSize,
            cancellationToken);

    [HttpGet("/api/ports/{portId:guid}/tasks")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public Task<IActionResult> GetPortTasksAsync(
        Guid portId,
        [FromQuery] Guid? zoneId,
        [FromQuery] string? status,
        [FromQuery] bool includeSimulation = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        CancellationToken cancellationToken = default)
        => GetTasksForScopeAsync(
            portId,
            zoneId,
            status,
            includeSimulation,
            page,
            pageSize,
            cancellationToken);

    private async Task<IActionResult> GetTasksForScopeAsync(
        Guid? requestedPortId,
        Guid? zoneId,
        string? status,
        bool includeSimulation,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        if (!TryResolvePortScope(requestedPortId, out var scopedPortId))
        {
            return Forbid();
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            return BadRequest(new
            {
                code = "TASK_STATUS_NOT_SUPPORTED",
                message = "operational.task_logs is an immutable SOP recommendation log and has no status column. Add a task workflow migration before filtering by PENDING or COMPLETED."
            });
        }

        page = NormalizePage(page);
        pageSize = NormalizePageSize(pageSize);

        var query = _dbContext.TaskLogs.AsNoTracking();
        if (scopedPortId.HasValue)
        {
            query = query.Where(x => x.PortId == scopedPortId.Value);
        }

        if (zoneId.HasValue)
        {
            query = query.Where(x => x.ZoneId == zoneId.Value);
        }

        if (!includeSimulation)
        {
            query = query.Where(x => !x.IsSimulation);
        }

        var total = await query.CountAsync(cancellationToken);
        var tasks = await query
            .OrderByDescending(x => x.RiskLevelAtCreation)
            .ThenByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new TaskLogDto(
                x.Id,
                x.PortId,
                x.ZoneId,
                x.TriggeredByRuleId,
                x.TriggeredByAssessmentId,
                x.ActionType,
                x.ActionDescription,
                x.RiskLevelAtCreation,
                x.CreatedAt,
                x.IsSimulation))
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            data = tasks,
            schemaCapability = new
            {
                isRecommendationLog = true,
                supportsWorkflowStatus = false
            },
            pagination = new
            {
                page,
                pageSize,
                total,
                totalPages = GetTotalPages(total, pageSize)
            }
        });
    }

    private bool TryResolvePortScope(Guid? requestedPortId, out Guid? scopedPortId)
    {
        if (IsAdmin())
        {
            scopedPortId = requestedPortId;
            return true;
        }

        var assignedPortId = GetAssignedPortId();
        if (assignedPortId is null ||
            requestedPortId.HasValue && requestedPortId.Value != assignedPortId.Value)
        {
            scopedPortId = null;
            return false;
        }

        scopedPortId = assignedPortId;
        return true;
    }

    private bool IsAdmin()
        => string.Equals(
            User.FindFirst(ClaimNames.Role)?.Value,
            nameof(UserRole.ADMIN),
            StringComparison.Ordinal);

    private Guid? GetAssignedPortId()
    {
        var claim = User.FindFirst(ClaimNames.AssignedPortId)?.Value;
        return Guid.TryParse(claim, out var portId) ? portId : null;
    }

    private static int NormalizePage(int page) => page < 1 ? 1 : page;

    private static int NormalizePageSize(int pageSize)
        => pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

    private static int GetTotalPages(int total, int pageSize)
        => total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);
}
