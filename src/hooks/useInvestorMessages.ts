import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { API_BASE_URL } from "../utils/investorDashboard";
import type { DashboardMessage } from "../types/investorDashboard";
import { useTranslation } from "../i18n/I18nProvider";

const READ_URL = `${API_BASE_URL}/auth/investor/messages.php`;
const SEND_URL = `${API_BASE_URL}/auth/investor/send-message.php`;
const POLL_INTERVAL = 15000;

export function useInvestorMessages() {
  const { language } = useTranslation();
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const labels = language === "fr"
    ? { load: "Impossible de charger les messages.", connection: "Impossible de contacter le serveur.", write: "Écrivez d'abord votre message.", send: "Impossible d'envoyer le message.", sent: "Message envoyé à l'administration." }
    : language === "en"
      ? { load: "Unable to load messages.", connection: "Unable to contact the server.", write: "Please write your message first.", send: "Unable to send the message.", sent: "Message sent to the administration." }
      : { load: "تعذر تحميل الرسائل.", connection: "تعذر الاتصال بالخادم.", write: "اكتب الرسالة أولاً.", send: "تعذر إرسال الرسالة.", sent: "تم إرسال الرسالة إلى الإدارة." };

  const read = useCallback(async () => {
    const stored = localStorage.getItem("aapi_user");
    let userId = 0;
    try { userId = Number((JSON.parse(stored || "{}") as { id?: number }).id || 0); } catch { userId = 0; }
    if (!userId) return;

    try {
      const response = await fetch(READ_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: userId }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(labels.load);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : labels.connection);
    } finally {
      setLoading(false);
    }
  }, [labels.load, labels.connection]);

  useEffect(() => {
    void read();
    const timer = window.setInterval(() => void read(), POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [read]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(""); setSuccess("");
    const stored = localStorage.getItem("aapi_user");
    let userId = 0;
    try { userId = Number((JSON.parse(stored || "{}") as { id?: number }).id || 0); } catch { userId = 0; }
    if (!userId || !contenu.trim()) { setError(labels.write); return; }

    setSending(true);
    try {
      const response = await fetch(SEND_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: userId, sujet: sujet.trim(), contenu: contenu.trim() }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(labels.send);
      setSujet(""); setContenu(""); setSuccess(labels.sent);
      await read();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : labels.connection);
    } finally {
      setSending(false);
    }
  };

  return { messages, sujet, setSujet, contenu, setContenu, loading, sending, error, success, submit, refresh: read };
}

export default useInvestorMessages;
