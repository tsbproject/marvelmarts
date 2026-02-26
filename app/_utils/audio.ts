// app/utils/audio.ts
export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3'); 
  audio.play().catch(err => console.log("Audio blocked by browser autoplay policy", err));
};




export const playNotifySound = () => {
  const isMuted = localStorage.getItem("marvelmarts_muted") === "true";
  
  if (isMuted) return;

  const audio = new Audio("/sounds/notification.mp3");
  audio.play().catch((err) => {
    // Browsers block audio until the user clicks something on the page
    console.warn("Audio playback delayed: Interaction required.", err);
  });
};