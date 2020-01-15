<?php
namespace App\concern\Helpers;

use PHPMailer\PHPMailer\PHPMailer;

class MailHelper
{
    /**
     * Username Server SMTP
     */
    CONST USERNAME = 'vincentcapek@gmail.com';
    /**
     * Password Server SMTP
     */
    CONST PASSWORD = 'Damien13127';

    /**
     * @var PHPMailer
     */
    private $phpmailer;
    /**
     * @var FileRenderHelper
     */
    private $fileRenderHelper;
    /**
     * @var string Path Name Email Render
     */
    private $pathNameEmail = '';

    /**
     * Mail constructor.
     * @param PHPMailer $phpmailer
     * @param FileRenderHelper $fileRenderHelper
     */
    public function __construct(PHPMailer $phpmailer, FileRenderHelper $fileRenderHelper)
    {
        $this->phpmailer = $phpmailer;
        $this->fileRenderHelper = $fileRenderHelper;

        $this->pathNameEmail = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'render/passwordConfirm.php';
    }

    /**
     * Enjoy Email IF Request Mail is correct
     * @return array
     * @throws \PHPMailer\PHPMailer\Exception
     */
    private function SendMailPassword () : array
    {
        $status_mail = [];
        if(!$this->phpmailer->send()) {
            $status_mail["error"] = 'Message was not sent, Mailer error: ' . $this->phpmailer->ErrorInfo;
        } else {
            $status_mail["success"] = 'Message has been sent.';
        }
        return $status_mail;
    }

    /**
     * Connect Server SMTP for enjoyed Email !!!
     */
    private function ConnectServerSMTP ()
    {
        // Set Port, Server SMTP AND SMTP Account username And password !!!
        $this->phpmailer->Host = 'smtp.gmail.com';
        $this->phpmailer->Port = '587';
        $this->phpmailer->Username   = self::USERNAME;
        $this->phpmailer->Password   = self::PASSWORD;
        $this->phpmailer->SMTPSecure = 'tls';
    }

    /**
     * Configuration SMTP EMAIL !!!
     */
    private function ConfigureParamsSMTP ()
    {
        // Configure Mail Smtp
        // Use Method IsSMTP for telling the class to use SMTP !!!
        $this->phpmailer->isSMTP();
        $this->phpmailer->SMTPAuth = true;
        $this->ConnectServerSMTP();
    }

    /**
     * @param string $email_to
     * @param string $username_to
     * @throws \PHPMailer\PHPMailer\Exception
     */
    private function EmailParamsInfo (string $email_to, string $username_to)
    {
        // Enjoy Mail From address Admin to Email User with method addAddress And SetFrom !!!
        $this->phpmailer->setFrom("vincentcapek@gmail.com", "Bluup-A0mine");
        $this->phpmailer->addAddress($email_to, $username_to);
    }

    /**
     * @param string $subject_message
     * @param string $body_message
     * @param bool $type
     * @return bool|null
     */
    private function HtmlSubBodyMail (string $subject_message, string $body_message, bool $type = false)
    {
        if ($type === false) {
            return null;
        }
        // Write in the mail the subject and the body !!!
        // Validate HTML Mail !!!
        $this->phpmailer->IsHtml($type);
        $this->phpmailer->Subject = $subject_message;
        $this->phpmailer->Body = $body_message;
        return true;
    }

    /**
     * @param string $username
     * @param string $email
     * @param string $token
     * @return array
     * @throws \PHPMailer\PHPMailer\Exception
     */
    public function SendMail (string $username, string $email, string $token) : array
    {
        $this->ConfigureParamsSMTP();
        $this->EmailParamsInfo($email, $username);

        // Args Image For Email !!!
        $this->phpmailer->addEmbeddedImage(public_path() . '/img/person-icon-silhouette_87718.png', 'logo_person');
        $this->phpmailer->addEmbeddedImage(public_path() . '/img/user-man-circle-invert-512.png', 'logo_user');

        $args = [
            'emailUser' => $email,
            'tokenUser' => $token
        ];

        // Body mail !!!;
        $body = $this->fileRenderHelper->renderPhpInString($this->pathNameEmail, $args);
        $this->HtmlSubBodyMail('Password Confirmation', $body, TRUE);

        // Send Mail with method SendMailPassword !!!
        return $this->SendMailPassword();
    }
}
