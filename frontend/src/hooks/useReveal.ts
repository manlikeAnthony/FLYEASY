import { useEffect } from "react";
export function useReveal() {
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const elements=document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-revealed");observer.unobserve(entry.target);}}),{threshold:.12});
    elements.forEach(element=>{element.classList.add("reveal-ready");observer.observe(element);});
    return()=>{observer.disconnect();elements.forEach(element=>element.classList.remove("reveal-ready"));};
  },[]);
}
