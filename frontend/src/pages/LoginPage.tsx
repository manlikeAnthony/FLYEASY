import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Mail } from "lucide-react";
import type { AxiosError } from "axios";
import api, { storeAccessToken } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";

type AuthError={message?:string;code?:string};
export default function LoginPage(){
  const {setUser}=useAuth();const navigate=useNavigate();const cache=useQueryClient();
  const [loading,setLoading]=useState(false);const [email,setEmail]=useState("");const [error,setError]=useState<AuthError|null>(null);const [resending,setResending]=useState(false);const [notice,setNotice]=useState("");
  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();const values=new FormData(e.currentTarget);const address=String(values.get("email")||"").trim();setEmail(address);setLoading(true);setError(null);setNotice("");
    try{const response=await api.post("/auth/login",{email:address,password:String(values.get("password")||"")});const payload=response.data?.data||response.data;const user=payload.user||payload;if(payload.accessToken)storeAccessToken(payload.accessToken);cache.clear();setUser({...user,id:user.id||user.userId||user._id});navigate(user.role==="ADMIN"?"/admin":"/my",{replace:true});}
    catch(reason){const failure=reason as AxiosError<AuthError>;setError(failure.response?.data||{message:"We couldn’t sign you in. Please try again."});}finally{setLoading(false);}
  };
  const resend=async()=>{setResending(true);setNotice("");try{await api.post("/auth/resend-verification-email",{email});setNotice("A fresh verification link is on its way. Check your inbox.");}catch{setNotice("We couldn’t resend the link. Try again shortly.");}finally{setResending(false);}};
  return <AuthShell mode="login"><span className="eyebrow">YOUR TRAVEL SPACE</span><h1>Good to have<br/>you <em>back.</em></h1><p className="auth-lead">Pick up where your next chapter left off.</p><form onSubmit={submit} className="auth-editorial-form">{error&&<div className="error-state" role="alert">{error.message||"Unable to sign in."}</div>}<label className="auth-field">Email address<div className="email-input-wrap"><Mail size={18}/><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" defaultValue={email}/></div></label><PasswordField/><Link className="auth-forgot" to="/forgot-password">Forgot your password?</Link><button className="ink-button auth-submit" disabled={loading}>{loading?"Opening your travel space…":"Let’s get you in"}<ArrowRight size={19}/></button>{error?.code==="EMAIL_NOT_VERIFIED"&&<button className="text-link" type="button" disabled={resending} onClick={resend}>{resending?"Sending your link…":"Resend verification email"}</button>}{notice&&<p className="auth-notice" role="status">{notice}</p>}</form><p className="auth-switch">New around here? <Link to="/register">Make yourself at home <ArrowRight size={15}/></Link></p></AuthShell>;
}
