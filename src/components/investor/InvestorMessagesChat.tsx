import { useInvestorMessages } from "../../hooks/useInvestorMessages";
import { useTranslation } from "../../i18n/I18nProvider";
import "../../styles/investor-messages.css";

export default function InvestorMessagesChat() {
  const { t } = useTranslation();
  const chat = useInvestorMessages();
  const stored = localStorage.getItem("aapi_user");
  const userId = stored ? Number((JSON.parse(stored) as { id?: number }).id) : 0;

  return (
    <section className="investor-dashboard-section">
      <div className="investor-dashboard-page-header"><div>
        <span className="investor-dashboard-overline">{t("investorDashboard.messages.overline")}</span>
        <h1>{t("investorDashboard.messages.title")}</h1>
        <p>{t("investorDashboard.messages.description")}</p>
      </div></div>
      <div className="investor-messages-layout">
        <div className="investor-dashboard-card investor-messages-card">
          <div className="investor-messages-header"><strong>{t("investorDashboard.messages.agency")}</strong><span>{t("investorDashboard.messages.official")}</span></div>
          <div className="investor-messages-thread">
            {chat.messages.map((message) => {
              const mine = Number(message.sender_id) === userId;
              return <div key={message.id} className={`investor-message-bubble-row ${mine ? "mine" : "admin"}`}><div className="investor-message-bubble"><span>{mine ? t("investorDashboard.messages.you") : t("investorDashboard.messages.admin")}</span><p>{message.contenu}</p><small>{message.created_at}</small></div></div>;
            })}
            {!chat.messages.length && !chat.loading && <div className="investor-messages-empty">{t("investorDashboard.messages.empty")}</div>}
          </div>
        </div>
        <div className="investor-dashboard-card investor-message-compose-card">
          <h2>{t("investorDashboard.messages.composeTitle")}</h2>
          <form onSubmit={chat.submit} className="investor-message-compose-form">
            <label>{t("investorDashboard.messages.subject")}<input value={chat.sujet} onChange={(e) => chat.setSujet(e.target.value)} placeholder={t("investorDashboard.messages.subjectPlaceholder")} /></label>
            <label>{t("investorDashboard.messages.message")}<textarea value={chat.contenu} onChange={(e) => chat.setContenu(e.target.value)} rows={8} placeholder={t("investorDashboard.messages.messagePlaceholder")} required /></label>
            {chat.error && <div className="investor-investment-form-message error">{chat.error}</div>}
            {chat.success && <div className="investor-investment-form-message success">{chat.success}</div>}
            <button className="investor-dashboard-primary-btn" disabled={chat.sending}>{chat.sending ? t("investorDashboard.messages.sending") : t("investorDashboard.messages.send")}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
