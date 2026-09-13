import { useState } from "react";
import type { FormEvent } from "react";
import { API_BASE_URL } from "../utils/investorDashboard";

const API_URL = `${API_BASE_URL}/auth/investor/send-message.php`;

export function useSendInvestorMessage(reload: () => Promise<void>) {
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setSuccess("");
    const stored = localStorage.getItem("aapi_user");
    const userId = stored ? Number((JSON.parse(stored) as { id?: number }).id) : 0;
    if (!userId || !contenu.trim()) { setError("اكتب الرسالة أولاً."); return; }
    setSending(true);
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ user_id: userId, sujet: sujet.trim(), contenu: contenu.trim() }) });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر إرسال الرسالة.");
      setSujet(""); setContenu(""); setSuccess(data.message || "تم إرسال الرسالة بنجاح.");
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر الاتصال بالخادم."); }
    finally { setSending(false); }
  };
  return { sujet, setSujet, contenu, setContenu, sending, error, success, submit };
}
export default useSendInvestorMessage;
