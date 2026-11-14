import api from "./api";
export type NotificationItem={_id:string;title:string;body:string;href:string;kind:string;readAt:string|null;createdAt:string;email?:{status:string};whatsapp?:{status:string}};
export type NotificationInbox={items:NotificationItem[];unread:number;total:number;page:number;hasMore:boolean};
export type NotificationPreferences={emailEnabled:boolean;whatsappEnabled:boolean;whatsappNumber:string};
export const getNotifications=async(page=1)=>(await api.get("/notifications",{params:{page}})).data.data as NotificationInbox;
export const getNotificationPreferences=async()=>(await api.get("/notifications/preferences")).data.data as NotificationPreferences;
export const notificationKey=(identity:string,page=1)=>["notifications",identity,page];
