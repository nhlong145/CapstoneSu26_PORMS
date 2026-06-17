using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using PORMS.API.Controllers;
using PORMS.API.Extensions;
using PORMS.Application.Common;
using PORMS.Domain.Enums;
using Xunit;

namespace PORMS.Tests.Unit;

public sealed class PortAuthorizationTests
{
    [Fact]
    public void Admin_CanAccessAnyPort()
    {
        var context = CreateContext(UserRole.ADMIN, assignedPortId: null);

        Assert.True(context.IsAuthorizedForPort(Guid.NewGuid()));
    }

    [Fact]
    public void AssignedUser_CanOnlyAccessAssignedPort()
    {
        var assignedPortId = Guid.NewGuid();
        var context = CreateContext(UserRole.OPERATOR, assignedPortId);

        Assert.True(context.IsAuthorizedForPort(assignedPortId));
        Assert.False(context.IsAuthorizedForPort(Guid.NewGuid()));
    }

    [Fact]
    public void AnonymousUser_CannotAccessPort()
    {
        var context = new DefaultHttpContext();

        Assert.False(context.IsAuthorizedForPort(Guid.NewGuid()));
    }

    [Theory]
    [InlineData(typeof(WeatherController), nameof(WeatherController.CreateManualInputAsync))]
    [InlineData(typeof(WeatherController), nameof(WeatherController.FetchNowAsync))]
    [InlineData(typeof(OperationModeController), nameof(OperationModeController.OverrideAsync))]
    [InlineData(typeof(SimulationController), nameof(SimulationController.StartAsync))]
    [InlineData(typeof(SimulationController), nameof(SimulationController.TriggerScenarioAsync))]
    public void WriteEndpoints_RequireAdminOrCompanyAdminPolicy(
        Type controllerType,
        string methodName)
    {
        var method = controllerType.GetMethod(methodName);

        var authorize = Assert.Single(
            method!.GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
                .Cast<AuthorizeAttribute>());
        Assert.Equal("AdminOrCompanyAdmin", authorize.Policy);
    }

    [Theory]
    [InlineData(typeof(PortStatusController))]
    [InlineData(typeof(AlertController))]
    [InlineData(typeof(TaskController))]
    [InlineData(typeof(SimulationController))]
    public void DemoControllers_RequireAuthenticatedUser(Type controllerType)
    {
        var authorize = Assert.Single(
            controllerType
                .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
                .Cast<AuthorizeAttribute>());

        Assert.Null(authorize.Policy);
    }

    [Fact]
    public void DemoEndpoints_ExposeRequestedRoutes()
    {
        AssertRoute<HttpGetAttribute>(
            typeof(PortStatusController),
            nameof(PortStatusController.GetLiveStatusAsync),
            "{portId:guid}/live-status");
        AssertRoute<HttpGetAttribute>(
            typeof(AlertController),
            nameof(AlertController.GetPortAlertsAsync),
            "/api/ports/{portId:guid}/alerts");
        AssertRoute<HttpPutAttribute>(
            typeof(AlertController),
            nameof(AlertController.MarkReadAsync),
            "{alertId:guid}/read");
        AssertRoute<HttpGetAttribute>(
            typeof(TaskController),
            nameof(TaskController.GetPortTasksAsync),
            "/api/ports/{portId:guid}/tasks");
        AssertRoute<HttpPostAttribute>(
            typeof(SimulationController),
            nameof(SimulationController.TriggerScenarioAsync),
            "/api/ports/{portId:guid}/simulation/trigger-scenario");
    }

    private static DefaultHttpContext CreateContext(UserRole role, Guid? assignedPortId)
    {
        var claims = new List<Claim>
        {
            new(ClaimNames.UserId, Guid.NewGuid().ToString()),
            new(ClaimNames.Role, role.ToString())
        };

        if (assignedPortId.HasValue)
        {
            claims.Add(new Claim(ClaimNames.AssignedPortId, assignedPortId.Value.ToString()));
        }

        return new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"))
        };
    }

    private static void AssertRoute<TAttribute>(
        Type controllerType,
        string methodName,
        string expectedTemplate)
        where TAttribute : HttpMethodAttribute
    {
        var method = controllerType.GetMethod(methodName);
        var route = Assert.Single(
            method!.GetCustomAttributes(typeof(TAttribute), inherit: true)
                .Cast<TAttribute>());

        Assert.Equal(expectedTemplate, route.Template);
    }
}
