import { useEffect, useRef } from "react";

export function usePageVisibility(onHide: () => void, onShow: () => void) {
  const onHideRef = useRef(onHide);
  const onShowRef = useRef(onShow);
  const hiddenRef = useRef(false);
  onHideRef.current = onHide;
  onShowRef.current = onShow;

  useEffect(() => {
    function handle() {
      if (document.hidden) {
        hiddenRef.current = true;
        onHideRef.current();
      } else if (hiddenRef.current) {
        hiddenRef.current = false;
        onShowRef.current();
      }
    }
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);
}
