export const checkAuthFromStorage = () => {
	if (typeof window === "undefined") return false;
	return !!(
		window.localStorage.getItem("auth") || window.sessionStorage.getItem("auth")
	);
};
