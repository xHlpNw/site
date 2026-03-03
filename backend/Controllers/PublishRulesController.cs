using Microsoft.AspNetCore.Mvc;

namespace AutoSeller.Api.Controllers;

/// <summary>
/// Правила публикации объявлений. Отдаёт JSON для отображения в модальном окне на странице создания объявления.
/// </summary>
[ApiController]
[Route("api/publish-rules")]
public class PublishRulesController : ControllerBase
{
    /// <summary>
    /// Получить правила публикации объявления (загрузка по запросу, например при нажатии кнопки на странице публикации).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PublishRulesResponse), StatusCodes.Status200OK)]
    public ActionResult<PublishRulesResponse> Get()
    {
        return Ok(new PublishRulesResponse
        {
            Title = "Правила публикации объявления",
            Sections = new[]
            {
                new PublishRulesSection("1. Общие требования", "Размещать объявления о продаже автомобилей могут только зарегистрированные пользователи. Объявление должно содержать достоверную информацию об автомобиле и контактные данные продавца."),
                new PublishRulesSection("2. Обязательные данные", "В объявлении необходимо указать: марку и модель, год выпуска, пробег, тип коробки передач, тип привода, тип кузова, цену, описание состояния автомобиля. Загрузка минимум одной фотографии обязательна."),
                new PublishRulesSection("3. Фотографии", "Фотографии должны быть чёткими и соответствовать продаваемому автомобилю. Допускаются форматы PNG и JPG. Размер одного файла — не более 10 МБ. Запрещается размещать чужие изображения без разрешения правообладателя."),
                new PublishRulesSection("4. Запрещённый контент", "Запрещается размещать объявления с оскорбительным или вводящим в заблуждение текстом, дублировать одно и то же объявление многократно, указывать заведомо ложную информацию о состоянии или характеристиках автомобиля."),
                new PublishRulesSection("5. Модерация", "Администрация оставляет за собой право снять объявление с публикации без предварительного уведомления в случае нарушения правил. При повторных нарушениях аккаунт пользователя может быть заблокирован.")
            }
        });
    }
}

public class PublishRulesResponse
{
    public string Title { get; set; } = string.Empty;
    public IReadOnlyList<PublishRulesSection> Sections { get; set; } = Array.Empty<PublishRulesSection>();
}

public class PublishRulesSection
{
    public PublishRulesSection() { }

    public PublishRulesSection(string heading, string text)
    {
        Heading = heading;
        Text = text;
    }

    public string Heading { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}
