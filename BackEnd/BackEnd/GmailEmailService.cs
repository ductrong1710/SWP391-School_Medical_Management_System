using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using MimeKit;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

public class GmailEmailService
{
    private readonly string[] Scopes = { GmailService.Scope.GmailSend };
    private readonly string ApplicationName = "SchoolMedicalNotification";
    private readonly string CredentialsPath;
    private readonly string TokenPath;

    public GmailEmailService(string credentialsPath, string tokenPath)
    {
        CredentialsPath = credentialsPath;
        TokenPath = tokenPath;
    }

    private async Task<GmailService> GetGmailServiceAsync()
    {
        UserCredential credential;
        using (var stream = new FileStream(CredentialsPath, FileMode.Open, FileAccess.Read))
        {
            credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                GoogleClientSecrets.FromStream(stream).Secrets,
                Scopes,
                "user", // hoặc email tài khoản bạn muốn gửi
                CancellationToken.None,
                new FileDataStore(TokenPath, true));
        }

        return new GmailService(new BaseClientService.Initializer()
        {
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName,
        });
    }

    public async Task SendVaccinationNotificationAsync(string to, string studentName, string className, string vaccineName, string dateTime, string location, string registrationLink)
    {
        string subject = "Thông báo lịch tiêm chủng cho học sinh";
        string body = $@"
Kính gửi Quý phụ huynh,<br><br>
Nhà trường xin thông báo lịch tiêm chủng cho học sinh như sau:<br><br>
- Họ và tên học sinh: {studentName}<br>
- Lớp: {className}<br>
- Loại vắc xin: {vaccineName}<br>
- Thời gian tiêm: {dateTime}<br>
- Địa điểm: {location}<br><br>
Xin quý phụ huynh đăng ký tham gia tiêm chủng tại đây: <a href='{registrationLink}'>Đăng ký tiêm chủng</a><br><br>
Trân trọng,<br>
Ban Y tế Trường
";
        await SendEmailAsync(to, subject, body, isHtml: true);
    }

    public async Task SendHealthCheckRegistrationNotificationAsync(string to, string studentName, string className, string dateTime, string location, string registrationLink)
    {
        string subject = "Thông báo đăng ký khám sức khỏe định kỳ cho học sinh";
        string body = $@"
Kính gửi Quý phụ huynh,<br><br>
Nhà trường xin thông báo về đợt khám sức khỏe định kỳ cho học sinh như sau:<br><br>
- Họ và tên học sinh: {studentName}<br>
- Lớp: {className}<br>
- Thời gian khám: {dateTime}<br>
- Địa điểm: {location}<br><br>
Xin quý phụ huynh đăng ký tham gia khám sức khỏe tại đây: <a href='{registrationLink}'>Đăng ký khám sức khỏe</a><br><br>
Trân trọng,<br>
Ban Y tế Trường
";
        await SendEmailAsync(to, subject, body, isHtml: true);
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false)
    {
        var gmailService = await GetGmailServiceAsync();

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("School Health", "healthconnectschool@gmail.com"));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;
        if (isHtml)
            message.Body = new TextPart("html") { Text = body };
        else
            message.Body = new TextPart("plain") { Text = body };

        using (var stream = new MemoryStream())
        {
            message.WriteTo(stream);
            var rawMessage = Convert.ToBase64String(stream.ToArray())
                .Replace('+', '-').Replace('/', '_').Replace("=", "");

            var gmailMessage = new Message { Raw = rawMessage };
            await gmailService.Users.Messages.Send(gmailMessage, "me").ExecuteAsync();
        }
    }
} 