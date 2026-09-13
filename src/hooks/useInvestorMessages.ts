import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { API_BASE_URL } from "../utils/investorDashboard";
import type { DashboardMessage } from "../types/investorDashboard";

const READ_URL = `${API_BASE_URL}/auth/investor/messages.php`;
const SEND_URL = `${API_BASE_URL}/auth/investor/send-message.php`;

export function useInvestorMessages() {
  const [messages,setMessages]=useState<DashboardMessage[]>([]);
  const [sujet,setSujet]=useState("");
  const [contenu,setContenu]=useState("");
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const read=useCallback(async()=>{
    const stored=localStorage.getItem("aapi_user");const userId=stored?Number((JSON.parse(stored) as {id?:number}).id):0;if(!userId)return;
    try{const r=await fetch(READ_URL,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({user_id:userId})});const d=await r.json();if(!r.ok||!d?.success)throw new Error(d?.message||"تعذر تحميل الرسائل.");setMessages(Array.isArray(d.messages)?d.messages:[]);setError("");}catch(e){setError(e instanceof Error?e.message:"تعذر الاتصال بالخادم.");}finally{setLoading(false);}
  },[]);
  useEffect(()=>{void read();const timer=window.setInterval(()=>void read(),5000);return()=>window.clearInterval(timer)},[read]);
  const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setError("");setSuccess("");const stored=localStorage.getItem("aapi_user");const userId=stored?Number((JSON.parse(stored) as {id?:number}).id):0;if(!userId||!contenu.trim()){setError("اكتب الرسالة أولاً.");return;}setSending(true);try{const r=await fetch(SEND_URL,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({user_id:userId,sujet:sujet.trim(),contenu:contenu.trim()})});const d=await r.json();if(!r.ok||!d?.success)throw new Error(d?.message||"تعذر إرسال الرسالة.");setSujet("");setContenu("");setSuccess("تم إرسال الرسالة إلى الإدارة.");await read();}catch(e){setError(e instanceof Error?e.message:"تعذر الاتصال بالخادم.");}finally{setSending(false)}};
  return {messages,sujet,setSujet,contenu,setContenu,loading,sending,error,success,submit,refresh:read};
}
export default useInvestorMessages;
