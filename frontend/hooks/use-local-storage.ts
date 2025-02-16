import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
	// Get stored value from localStorage or use initialValue
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === "undefined") {
			return initialValue;
		}
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(error);
			return initialValue;
		}
	});

	// Update localStorage when the state changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				window.localStorage.setItem(key, JSON.stringify(storedValue));
			} catch (error) {
				console.error(error);
			}
		}
	}, [key, storedValue]);

	return [storedValue, setStoredValue] as const;
}
